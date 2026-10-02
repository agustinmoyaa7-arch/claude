-- Pruebas del aislamiento multi-tenant. Correr con: bash supabase/tests/run.sh
\set ON_ERROR_STOP on
create schema t;
create table t.ctx (k text primary key, v text);
create function t.login(u uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', u::text, false); execute 'set role authenticated'; end $$;
create function t.logout() returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claim.sub', '', false); end $$;
create function t.ok(cond boolean, msg text) returns void language plpgsql as $$
begin if not cond then raise exception 'FALLÓ: %', msg; end if; raise notice 'ok  - %', msg; end $$;
grant usage on schema t to public;
grant all on t.ctx to public;

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@maga.test'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'b@pirata.test'),
  ('cccccccc-0000-0000-0000-000000000003', 'root@newwave.test');
insert into public.superadmins values ('cccccccc-0000-0000-0000-000000000003');

-- 1) alta self-serve
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
insert into t.ctx select 'ea', public.crear_empresa('Maga', 'maga');
select t.logout();
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
insert into t.ctx select 'eb', public.crear_empresa('El Pirata', 'pirata');
select t.logout();

-- 2) cada uno ve solo su empresa
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.ok((select count(*) from public.empresas) = 1, 'A ve solo 1 empresa');
select t.ok((select nombre from public.empresas) = 'Maga', 'A ve Maga');

-- 3) A carga empleados en su empresa
insert into public.empleados (empresa_id, nombre, codigo)
  select v::uuid, 'Juan', '1111' from t.ctx where k='ea';
insert into public.empleados (empresa_id, nombre, codigo)
  select v::uuid, 'Ana',  '2222' from t.ctx where k='ea';
select t.ok((select count(*) from public.empleados) = 2, 'A ve sus 2 empleados');

-- 4) A NO puede escribir en la empresa de B
do $$ begin
  begin
    insert into public.empleados (empresa_id, nombre, codigo)
      select v::uuid, 'Intruso', '9999' from t.ctx where k='eb';
    raise exception 'FALLÓ: A pudo insertar en la empresa de B';
  exception when insufficient_privilege then
    raise notice 'ok  - A no puede insertar empleados en B (RLS)';
  end;
end $$;
select t.logout();

-- B no ve nada de A
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.ok((select count(*) from public.empleados) = 0, 'B no ve empleados de A');
select t.ok((select count(*) from public.audit_logs) = 0, 'B no ve auditoría de A');
select t.logout();

-- 5) límite del plan gratis (3 empleados)
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.empleados (empresa_id, nombre, codigo)
  select v::uuid, 'Luis', '3333' from t.ctx where k='ea';
do $$ begin
  begin
    insert into public.empleados (empresa_id, nombre, codigo)
      select v::uuid, 'Cuarto', '4444' from t.ctx where k='ea';
    raise exception 'FALLÓ: se pasó del límite del plan';
  exception when sqlstate 'P0001' then
    raise notice 'ok  - el plan gratis bloquea el 4° empleado';
  end;
end $$;

-- 6) A no puede cambiarse el plan ni el estado
do $$ begin
  begin
    update public.empresas set plan_id = 'grande';
    raise exception 'FALLÓ: A pudo cambiar su plan';
  exception when insufficient_privilege then
    raise notice 'ok  - A no puede cambiar plan_id';
  end;
end $$;
update public.empresas set nombre = 'Maga SRL';
select t.ok((select nombre from public.empresas) = 'Maga SRL', 'A sí puede renombrar su empresa');
select t.logout();

-- 7) integridad cruzada: un fichaje no puede mezclar empleado de A con empresa de B
do $$ begin
  begin
    insert into public.fichajes (empresa_id, empleado_id, tipo)
      select (select v::uuid from t.ctx where k='eb'),
             (select id from public.empleados where codigo='1111'), 'entrada';
    raise exception 'FALLÓ: FK compuesta no frenó el cruce entre empresas';
  exception when foreign_key_violation then
    raise notice 'ok  - FK compuesta impide mezclar empresas';
  end;
end $$;

-- 8) kiosco: dispositivo + fichar
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.dispositivos (empresa_id, nombre, token_hash)
  select v::uuid, 'PC recepción', encode(extensions.digest('tok-maga', 'sha256'), 'hex')
  from t.ctx where k='ea';
select t.logout();

-- anon y authenticated NO pueden llamar a fichar()
do $$ begin
  set role anon;
  begin
    perform public.fichar('tok-maga', '1111');
    raise exception 'FALLÓ: anon pudo llamar fichar';
  exception when insufficient_privilege then
    raise notice 'ok  - anon no puede ejecutar fichar()';
  end;
  reset role;
  set role authenticated;
  begin
    perform public.fichar('tok-maga', '1111');
    raise exception 'FALLÓ: authenticated pudo llamar fichar';
  exception when insufficient_privilege then
    raise notice 'ok  - authenticated no puede ejecutar fichar()';
  end;
  reset role;
end $$;

set role service_role;
select t.ok((public.fichar('tok-maga','1111')->>'tipo') = 'entrada', 'primer fichaje = entrada');
select t.ok((public.fichar('tok-maga','1111')->>'error') = 'muy_pronto', 'doble toque en <1 min se rechaza');
reset role;
update public.fichajes set momento = momento - interval '2 hours';
set role service_role;
select t.ok((public.fichar('tok-maga','1111')->>'tipo') = 'salida', 'segundo fichaje = salida');
select t.ok((public.fichar('tok-maga','0000')->>'error') = 'codigo_invalido', 'código inexistente');
select t.ok((public.fichar('tok-malo','1111')->>'error') = 'dispositivo_invalido', 'token inválido');
reset role;

-- el código de A no sirve en dispositivo de B (otro tenant)
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
insert into public.dispositivos (empresa_id, nombre, token_hash)
  select v::uuid, 'PC Pirata', encode(extensions.digest('tok-pirata', 'sha256'), 'hex')
  from t.ctx where k='eb';
select t.logout();
set role service_role;
select t.ok((public.fichar('tok-pirata','1111')->>'error') = 'codigo_invalido', 'código de A no entra por dispositivo de B');
reset role;

-- 9) fichajes no se borran
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
do $$ begin
  begin
    delete from public.fichajes;
    raise exception 'FALLÓ: A pudo borrar fichajes';
  exception when insufficient_privilege then
    raise notice 'ok  - DELETE de fichajes denegado (se anulan)';
  end;
end $$;

-- 10) auditoría
update public.empleados set nombre = 'Juan Pérez' where codigo = '1111';
select t.ok((select count(*) from public.audit_logs where tabla='empleados' and accion='UPDATE') = 1, 'auditoría registra el cambio de empleado');
select t.logout();

-- 11) cuenta vencida = modo lectura, pero el kiosco sigue fichando
update public.empresas set estado = 'vencida' where slug = 'maga';
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.ok((select count(*) from public.empleados) = 3, 'vencida: sigue pudiendo leer');
do $$ begin
  begin
    update public.empleados set nombre = 'X' where codigo = '2222';
    if found then raise exception 'FALLÓ: vencida pudo editar'; end if;
    raise notice 'ok  - vencida: update no afecta filas (RLS)';
  exception when insufficient_privilege then raise notice 'ok  - vencida: edición bloqueada';
  end;
end $$;
select t.ok((select nombre from public.empleados where codigo='2222') = 'Ana', 'vencida: los datos no cambiaron');
select t.logout();
update public.fichajes set momento = momento - interval '2 hours';
set role service_role;
select t.ok((public.fichar('tok-maga','1111')->>'ok')::boolean, 'vencida: el kiosco igual ficha');
reset role;
update public.empresas set estado = 'suspendida' where slug = 'maga';
set role service_role;
select t.ok((public.fichar('tok-maga','2222')->>'error') = 'empresa_inactiva', 'suspendida: el kiosco rechaza');
reset role;

-- 12) superadmin ve todo
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.ok((select count(*) from public.empresas) = 2, 'superadmin ve las 2 empresas');
select t.logout();

\echo '=== TODAS LAS PRUEBAS PASARON ==='
