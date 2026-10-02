-- Pruebas del reporte plan vs real. Se corre después de aislamiento.test.sql (comparte la base).
\set ON_ERROR_STOP on
reset role;
-- Semana de prueba: lun 2026-09-07 ... dom 2026-09-13 (hora Argentina, UTC-3)
-- Empresa nueva para no mezclar con las del test anterior
insert into auth.users (id, email) values ('dddddddd-0000-0000-0000-000000000004', 'd@rep.test');
select t.login('dddddddd-0000-0000-0000-000000000004');
insert into t.ctx select 'er', public.crear_empresa('Reporte SA', 'reporte-sa');
insert into public.empleados (empresa_id, nombre, codigo)
  select v::uuid, 'Juan', '5555' from t.ctx where k='er';
insert into public.empleados (empresa_id, nombre, codigo)
  select v::uuid, 'Ana', '6666' from t.ctx where k='er';
-- Juan: lun a vie 9-17. Ana: viernes 20-02 (cruza medianoche)
insert into public.horarios (empresa_id, empleado_id, dia_semana, entrada, salida)
  select (select v::uuid from t.ctx where k='er'), e.id, d, '09:00', '17:00'
  from public.empleados e, generate_series(1,5) d where e.codigo = '5555';
insert into public.horarios (empresa_id, empleado_id, dia_semana, entrada, salida)
  select (select v::uuid from t.ctx where k='er'), e.id, 5, '20:00', '02:00'
  from public.empleados e where e.codigo = '6666';
select t.logout();

-- fichajes cargados como superusuario (momento exacto)
create function t.fx(p_cod text, p_tipo text, p_ts text) returns void language sql as $$
  insert into public.fichajes (empresa_id, empleado_id, tipo, momento)
  select e.empresa_id, e.id, p_tipo, (p_ts || '-03')::timestamptz
  from public.empleados e
  where e.codigo = p_cod and e.empresa_id = (select v::uuid from t.ctx where k='er') $$;
-- lunes: tarde (09:25-17:05)
select t.fx('5555','entrada','2026-09-07 09:25'), t.fx('5555','salida','2026-09-07 17:05');
-- martes: ok (08:58-17:02)
select t.fx('5555','entrada','2026-09-08 08:58'), t.fx('5555','salida','2026-09-08 17:02');
-- miércoles: salida anticipada (09:00-15:00)
select t.fx('5555','entrada','2026-09-09 09:00'), t.fx('5555','salida','2026-09-09 15:00');
-- jueves: ausente (sin fichajes)
-- viernes: extra (09:00-19:00)
select t.fx('5555','entrada','2026-09-11 09:00'), t.fx('5555','salida','2026-09-11 19:00');
-- sábado: franco trabajado (10-14)
select t.fx('5555','entrada','2026-09-12 10:00'), t.fx('5555','salida','2026-09-12 14:00');
-- Ana viernes noche: entra 20:05, sale sábado 02:10 → ok
select t.fx('6666','entrada','2026-09-11 20:05'), t.fx('6666','salida','2026-09-12 02:10');
-- un fichaje anulado no cuenta
update public.fichajes set anulado = true
  where momento = '2026-09-09 15:00-03'::timestamptz;
select t.fx('5555','salida','2026-09-09 16:30');

select t.login('dddddddd-0000-0000-0000-000000000004');
create temp table rep as
  select * from public.reporte_plan_vs_real((select v::uuid from t.ctx where k='er'), '2026-09-07', '2026-09-13');
select t.ok((select estado from rep where empleado='Juan' and fecha='2026-09-07') = 'tarde', 'lunes: tarde');
select t.ok((select estado from rep where empleado='Juan' and fecha='2026-09-08') = 'ok', 'martes: ok (dentro de tolerancia)');
select t.ok((select estado from rep where empleado='Juan' and fecha='2026-09-09') = 'salida_anticipada', 'miércoles: salida anticipada (16:30 con anulado ignorado)');
select t.ok((select estado from rep where empleado='Juan' and fecha='2026-09-10') = 'ausente', 'jueves: ausente');
select t.ok((select estado from rep where empleado='Juan' and fecha='2026-09-11') = 'extra', 'viernes: extra');
select t.ok((select diferencia_min from rep where empleado='Juan' and fecha='2026-09-11') = 120, 'viernes: +120 min');
select t.ok((select estado from rep where empleado='Juan' and fecha='2026-09-12') = 'franco_trabajado', 'sábado: franco trabajado');
select t.ok((select estado from rep where empleado='Ana' and fecha='2026-09-11') = 'ok', 'turno que cruza medianoche: ok');
select t.ok((select minutos_plan from rep where empleado='Ana' and fecha='2026-09-11') = 360, 'turno nocturno: 6 h de plan');
select t.ok((select count(*) from rep where empleado='Ana') = 1, 'Ana: una sola fila (la salida no genera franco)');
select t.logout();

-- otro tenant no ve nada
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.ok((select count(*) from public.reporte_plan_vs_real((select v::uuid from t.ctx where k='er'), '2026-09-07', '2026-09-13')) = 0, 'otra empresa recibe 0 filas del reporte');
select t.logout();

-- sin salida y rango inválido
select t.fx('6666','entrada','2026-09-13 20:00');
select t.login('dddddddd-0000-0000-0000-000000000004');
select t.ok((select count(*) from public.reporte_plan_vs_real((select v::uuid from t.ctx where k='er'), '2026-09-13', '2026-09-13') where estado='franco_trabajado') = 1, 'domingo: entrada sin salida sobre un día sin plan = franco_trabajado');
do $$ begin
  begin
    perform * from public.reporte_plan_vs_real((select v::uuid from t.ctx where k='er'), '2026-01-01', '2026-12-31');
    raise exception 'FALLÓ: aceptó un rango de un año';
  exception when others then
    if sqlerrm like 'FALLÓ%' then raise; end if;
    raise notice 'ok  - rango > 93 días se rechaza';
  end;
end $$;
select t.logout();
\echo '=== REPORTE: PRUEBAS OK ==='
