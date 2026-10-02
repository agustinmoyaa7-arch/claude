-- Reporte plan vs real: compara el cuadro semanal (horarios) con los fichajes.
-- security invoker: corre con los permisos de quien llama, así que RLS limita a sus empresas.
--
-- Estados:
--   ok · tarde · salida_anticipada · extra   (había plan y fichó)
--   ausente           plan sin fichajes en un día ya pasado
--   pendiente         plan sin fichajes hoy o a futuro
--   sin_salida        entrada sin salida en un día ya pasado
--   en_curso          entrada de hoy sin salida todavía
--   franco_trabajado  fichó un día sin turno en el cuadro

create function public.reporte_plan_vs_real(
  p_empresa uuid,
  p_desde date,
  p_hasta date,
  p_tolerancia_min int default 10
) returns table (
  fecha date,
  empleado_id uuid,
  empleado text,
  plan_entrada timestamptz,
  plan_salida timestamptz,
  real_entrada timestamptz,
  real_salida timestamptz,
  minutos_plan int,
  minutos_real int,
  diferencia_min int,
  estado text
)
language plpgsql stable security invoker set search_path = public as $$
#variable_conflict use_column
declare
  v_tz  text;
  v_hoy date;
begin
  if p_hasta < p_desde or p_hasta - p_desde > 92 then
    raise exception 'rango_invalido: máximo 93 días';
  end if;
  select zona_horaria into v_tz from public.empresas where id = p_empresa;
  if v_tz is null then return; end if;
  v_hoy := (now() at time zone v_tz)::date;

  return query
  with entradas as (
    select f.empleado_id as emp, f.momento as entrada,
           (f.momento at time zone v_tz)::date as fecha,
           (select s.momento from public.fichajes s
             where s.empresa_id = f.empresa_id and s.empleado_id = f.empleado_id
               and not s.anulado and s.tipo = 'salida' and s.momento > f.momento
             order by s.momento limit 1) as salida_cand,
           (select e2.momento from public.fichajes e2
             where e2.empresa_id = f.empresa_id and e2.empleado_id = f.empleado_id
               and not e2.anulado and e2.tipo = 'entrada' and e2.momento > f.momento
             order by e2.momento limit 1) as prox_entrada
    from public.fichajes f
    where f.empresa_id = p_empresa and not f.anulado and f.tipo = 'entrada'
      and (f.momento at time zone v_tz)::date between p_desde and p_hasta
  ),
  turnos as (  -- salida válida: antes de la próxima entrada y dentro de 20 h
    select emp, fecha, entrada,
           case when salida_cand is not null
                 and salida_cand < coalesce(prox_entrada, 'infinity'::timestamptz)
                 and salida_cand - entrada <= interval '20 hours'
                then salida_cand end as salida
    from entradas
  ),
  real as (
    select emp, fecha,
           min(entrada) as r_in,
           case when bool_and(salida is not null) then max(salida) end as r_out,
           coalesce(sum(extract(epoch from salida - entrada) / 60)::int, 0) as min_real
    from turnos group by emp, fecha
  ),
  plan as (
    select e.id as emp, e.nombre, d::date as fecha,
           ((d::date + h.entrada) at time zone v_tz) as p_in,
           ((d::date + h.salida) at time zone v_tz)
             + case when h.salida <= h.entrada then interval '1 day' else interval '0' end as p_out
    from public.empleados e
    cross join generate_series(p_desde, p_hasta, interval '1 day') d
    join public.horarios h on h.empleado_id = e.id and h.empresa_id = e.empresa_id
                          and h.dia_semana = extract(isodow from d)::int
    where e.empresa_id = p_empresa and e.activo
  ),
  unido as (
    select coalesce(p.emp, r.emp) as emp, coalesce(p.fecha, r.fecha) as fecha,
           p.p_in, p.p_out, r.r_in, r.r_out, r.min_real
    from plan p full join real r on r.emp = p.emp and r.fecha = p.fecha
  )
  select u.fecha, u.emp, emp.nombre, u.p_in, u.p_out, u.r_in, u.r_out,
         case when u.p_in is not null then (extract(epoch from u.p_out - u.p_in) / 60)::int end,
         u.min_real,
         case when u.p_in is not null and u.r_out is not null
              then u.min_real - (extract(epoch from u.p_out - u.p_in) / 60)::int end,
         case
           when u.p_in is null then 'franco_trabajado'
           when u.r_in is null then case when u.fecha < v_hoy then 'ausente' else 'pendiente' end
           when u.r_out is null then case when u.fecha < v_hoy then 'sin_salida' else 'en_curso' end
           when u.r_in  > u.p_in  + make_interval(mins => p_tolerancia_min) then 'tarde'
           when u.r_out < u.p_out - make_interval(mins => p_tolerancia_min) then 'salida_anticipada'
           when u.min_real - (extract(epoch from u.p_out - u.p_in) / 60)::int > p_tolerancia_min then 'extra'
           else 'ok'
         end
  from unido u
  join public.empleados emp on emp.id = u.emp and emp.empresa_id = p_empresa
  order by u.fecha, emp.nombre;
end $$;

revoke execute on function public.reporte_plan_vs_real(uuid, date, date, int) from public, anon;
grant  execute on function public.reporte_plan_vs_real(uuid, date, date, int) to authenticated;
