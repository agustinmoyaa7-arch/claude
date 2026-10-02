-- New Wave Fichaje · núcleo multi-tenant
-- Regla de oro: toda tabla de negocio lleva empresa_id y está protegida con RLS.

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── Planes ─────────────────────────
create table public.planes (
  id            text primary key,
  nombre        text not null,
  max_empleados int  not null check (max_empleados > 0),
  precio_ars    int  not null default 0 check (precio_ars >= 0),
  activo        boolean not null default true
);

insert into public.planes (id, nombre, max_empleados, precio_ars) values
  ('gratis', 'Gratis',  3,     0),
  ('basico', 'Básico',  10, 18000),
  ('medio',  'Medio',   25, 35000),
  ('grande', 'Grande',  50, 60000);

-- ───────────────────────── Empresas (tenants) ─────────────────────────
create table public.empresas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  slug          text not null unique
                check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  plan_id       text not null default 'gratis' references public.planes(id),
  estado        text not null default 'prueba'
                check (estado in ('prueba','activa','vencida','suspendida','cancelada')),
  prueba_hasta  timestamptz default (now() + interval '14 days'),
  zona_horaria  text not null default 'America/Argentina/Buenos_Aires',
  creado_en     timestamptz not null default now()
);

-- Quién puede entrar al panel de cada empresa
create table public.miembros (
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('dueno','encargado')),
  creado_en  timestamptz not null default now(),
  primary key (empresa_id, user_id)
);
create index miembros_user_idx on public.miembros (user_id);

-- Panel maestro de New Wave (vos)
create table public.superadmins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ───────────────────────── Funciones de permisos ─────────────────────────
create function public.es_superadmin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.superadmins where user_id = auth.uid())
$$;

create function public.es_miembro(p_empresa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.miembros
    where empresa_id = p_empresa and user_id = auth.uid()
  )
$$;

create function public.es_dueno(p_empresa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.miembros
    where empresa_id = p_empresa and user_id = auth.uid() and rol = 'dueno'
  )
$$;

-- Puede modificar datos: miembro de la empresa y cuenta en prueba o activa.
-- Si la cuenta está vencida queda en modo lectura (nunca se borran datos).
create function public.puede_editar(p_empresa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.es_superadmin()
      or (public.es_miembro(p_empresa)
          and exists (select 1 from public.empresas
                      where id = p_empresa and estado in ('prueba','activa')))
$$;

-- ───────────────────────── Tablas de negocio ─────────────────────────
create table public.sedes (
  id         uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre     text not null,
  lat        double precision,
  lng        double precision,
  radio_m    int check (radio_m is null or radio_m > 0),
  activa     boolean not null default true,
  unique (id, empresa_id)
);

create table public.empleados (
  id         uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre     text not null,
  codigo     text not null check (codigo ~ '^[0-9]{4,6}$'),
  activo     boolean not null default true,
  creado_en  timestamptz not null default now(),
  unique (id, empresa_id),
  unique (empresa_id, codigo)
);

-- PC / tablet fija de cada local (modo kiosco)
create table public.dispositivos (
  id         uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  sede_id    uuid,
  nombre     text not null,
  token_hash text not null unique,
  activo     boolean not null default true,
  ultimo_uso timestamptz,
  unique (id, empresa_id),
  foreign key (sede_id, empresa_id) references public.sedes(id, empresa_id)
);

-- Eventos de fichaje (entrada / salida). Nunca se borran: se anulan.
create table public.fichajes (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references public.empresas(id) on delete cascade,
  empleado_id    uuid not null,
  tipo           text not null check (tipo in ('entrada','salida')),
  momento        timestamptz not null default now(),
  dispositivo_id uuid,
  origen         text not null default 'kiosco' check (origen in ('kiosco','panel')),
  lat            double precision,
  lng            double precision,
  anulado        boolean not null default false,
  nota           text,
  creado_por     uuid,
  creado_en      timestamptz not null default now(),
  foreign key (empleado_id, empresa_id)    references public.empleados(id, empresa_id),
  foreign key (dispositivo_id, empresa_id) references public.dispositivos(id, empresa_id)
);
create index fichajes_emp_idx on public.fichajes (empresa_id, empleado_id, momento desc);
create index fichajes_tiempo_idx on public.fichajes (empresa_id, momento);

-- Cuadro semanal: el "plan" contra el que se compara el fichaje real.
-- dia_semana ISO (1 = lunes ... 7 = domingo). Sin fila = franco.
-- Si salida < entrada, el turno cruza la medianoche.
create table public.horarios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  empleado_id uuid not null,
  dia_semana  smallint not null check (dia_semana between 1 and 7),
  entrada     time not null,
  salida      time not null,
  unique (id, empresa_id),
  unique (empleado_id, dia_semana),
  foreign key (empleado_id, empresa_id) references public.empleados(id, empresa_id)
);

-- Suscripción de Mercado Pago (la escribe solo el webhook, con service_role)
create table public.suscripciones (
  id                 uuid primary key default gen_random_uuid(),
  empresa_id         uuid not null references public.empresas(id) on delete cascade,
  plan_id            text not null references public.planes(id),
  mp_subscription_id text unique,
  estado             text not null default 'pendiente',
  fecha_inicio       timestamptz,
  proximo_cobro      timestamptz,
  actualizado_en     timestamptz not null default now()
);

create table public.audit_logs (
  id         bigint generated always as identity primary key,
  empresa_id uuid not null,
  user_id    uuid,
  tabla      text not null,
  accion     text not null,
  fila_id    uuid,
  antes      jsonb,
  despues    jsonb,
  creado_en  timestamptz not null default now()
);
create index audit_empresa_idx on public.audit_logs (empresa_id, creado_en desc);

-- ───────────────────────── Auditoría ─────────────────────────
create function public.audit_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_empresa uuid; v_id uuid;
begin
  if tg_op = 'DELETE' then v_empresa := old.empresa_id; v_id := old.id;
  else v_empresa := new.empresa_id; v_id := new.id; end if;
  insert into public.audit_logs (empresa_id, user_id, tabla, accion, fila_id, antes, despues)
  values (v_empresa, auth.uid(), tg_table_name, tg_op, v_id,
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return null;
end $$;

create trigger audit_empleados after insert or update or delete on public.empleados
  for each row execute function public.audit_trigger();
create trigger audit_horarios after insert or update or delete on public.horarios
  for each row execute function public.audit_trigger();
create trigger audit_fichajes_cambios after update or delete on public.fichajes
  for each row execute function public.audit_trigger();
-- Los fichajes del kiosco no se auditan (volumen); sí los cargados a mano en el panel.
create trigger audit_fichajes_panel after insert on public.fichajes
  for each row when (new.origen = 'panel') execute function public.audit_trigger();

-- ───────────────────────── Límite del plan ─────────────────────────
create function public.check_limite_plan() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_max int; v_activos int;
begin
  if not new.activo then return new; end if;
  select p.max_empleados into v_max
    from public.empresas e join public.planes p on p.id = e.plan_id
    where e.id = new.empresa_id;
  select count(*) into v_activos from public.empleados
    where empresa_id = new.empresa_id and activo and id <> new.id;
  if v_activos + 1 > v_max then
    raise exception 'limite_plan: el plan permite hasta % empleados activos', v_max
      using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger empleados_limite_plan before insert or update of activo on public.empleados
  for each row execute function public.check_limite_plan();

-- ───────────────────────── RLS ─────────────────────────
alter table public.planes        enable row level security;
alter table public.empresas      enable row level security;
alter table public.miembros      enable row level security;
alter table public.superadmins   enable row level security;
alter table public.sedes         enable row level security;
alter table public.empleados     enable row level security;
alter table public.dispositivos  enable row level security;
alter table public.fichajes      enable row level security;
alter table public.horarios      enable row level security;
alter table public.suscripciones enable row level security;
alter table public.audit_logs    enable row level security;

create policy planes_lectura on public.planes for select to authenticated, anon using (activo);

-- Empresas: se leen siendo miembro; se crean solo con crear_empresa();
-- el dueño solo puede cambiar nombre y zona horaria (plan y estado: solo service_role).
create policy empresas_select on public.empresas for select to authenticated
  using (public.es_miembro(id) or public.es_superadmin());
create policy empresas_update on public.empresas for update to authenticated
  using (public.es_dueno(id) or public.es_superadmin())
  with check (public.es_dueno(id) or public.es_superadmin());
revoke update on public.empresas from authenticated;
grant update (nombre, zona_horaria) on public.empresas to authenticated;

create policy miembros_select on public.miembros for select to authenticated
  using (public.es_miembro(empresa_id) or public.es_superadmin());
create policy miembros_gestion on public.miembros for all to authenticated
  using (public.es_dueno(empresa_id) or public.es_superadmin())
  with check (public.es_dueno(empresa_id) or public.es_superadmin());

-- Tablas de negocio: leer = miembro; escribir = puede_editar
do $$
declare t text;
begin
  foreach t in array array['sedes','empleados','dispositivos','horarios'] loop
    execute format($f$create policy %1$s_select on public.%1$s for select to authenticated
      using (public.es_miembro(empresa_id) or public.es_superadmin())$f$, t);
    execute format($f$create policy %1$s_escritura on public.%1$s for all to authenticated
      using (public.puede_editar(empresa_id))
      with check (public.puede_editar(empresa_id))$f$, t);
  end loop;
end $$;

-- Fichajes: sin DELETE (se anulan)
create policy fichajes_select on public.fichajes for select to authenticated
  using (public.es_miembro(empresa_id) or public.es_superadmin());
create policy fichajes_insert on public.fichajes for insert to authenticated
  with check (public.puede_editar(empresa_id));
create policy fichajes_update on public.fichajes for update to authenticated
  using (public.puede_editar(empresa_id)) with check (public.puede_editar(empresa_id));
revoke delete on public.fichajes from authenticated;

create policy suscripciones_select on public.suscripciones for select to authenticated
  using (public.es_dueno(empresa_id) or public.es_superadmin());
create policy audit_select on public.audit_logs for select to authenticated
  using (public.es_miembro(empresa_id) or public.es_superadmin());
create policy superadmins_self on public.superadmins for select to authenticated
  using (user_id = auth.uid());

-- ───────────────────────── RPC ─────────────────────────
-- Alta self-serve: crea la empresa y deja al usuario como dueño.
create function public.crear_empresa(p_nombre text, p_slug text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'no_autenticado'; end if;
  insert into public.empresas (nombre, slug) values (trim(p_nombre), lower(trim(p_slug)))
    returning id into v_id;
  insert into public.miembros (empresa_id, user_id, rol) values (v_id, auth.uid(), 'dueno');
  return v_id;
end $$;

-- Fichaje del kiosco. Solo la llama el servidor (service_role) con el token del dispositivo.
create function public.fichar(p_token text, p_codigo text,
                              p_lat double precision default null,
                              p_lng double precision default null) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  d public.dispositivos; e public.empleados; ult public.fichajes;
  v_estado text; v_tipo text; v_ahora timestamptz := now();
begin
  select * into d from public.dispositivos
    where token_hash = encode(digest(p_token, 'sha256'), 'hex') and activo;
  if not found then return jsonb_build_object('ok', false, 'error', 'dispositivo_invalido'); end if;

  select estado into v_estado from public.empresas where id = d.empresa_id;
  if v_estado in ('suspendida','cancelada') then
    return jsonb_build_object('ok', false, 'error', 'empresa_inactiva');
  end if;

  select * into e from public.empleados
    where empresa_id = d.empresa_id and codigo = p_codigo and activo;
  if not found then return jsonb_build_object('ok', false, 'error', 'codigo_invalido'); end if;

  select * into ult from public.fichajes
    where empleado_id = e.id and not anulado order by momento desc limit 1;

  if found and v_ahora - ult.momento < interval '1 minute' then
    return jsonb_build_object('ok', false, 'error', 'muy_pronto', 'empleado', e.nombre);
  end if;

  -- Entrada si no hay fichaje previo o el último fue salida (o una entrada vieja sin salida).
  if found and ult.tipo = 'entrada' and v_ahora - ult.momento < interval '16 hours'
    then v_tipo := 'salida'; else v_tipo := 'entrada'; end if;

  insert into public.fichajes (empresa_id, empleado_id, tipo, momento, dispositivo_id, origen, lat, lng)
    values (d.empresa_id, e.id, v_tipo, v_ahora, d.id, 'kiosco', p_lat, p_lng);
  update public.dispositivos set ultimo_uso = v_ahora where id = d.id;

  return jsonb_build_object('ok', true, 'tipo', v_tipo, 'empleado', e.nombre, 'momento', v_ahora);
end $$;

-- Permisos de ejecución (Supabase da EXECUTE a todos por defecto: se cierra explícitamente)
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.es_superadmin()      to authenticated;
grant execute on function public.es_miembro(uuid)     to authenticated;
grant execute on function public.es_dueno(uuid)       to authenticated;
grant execute on function public.puede_editar(uuid)   to authenticated;
grant execute on function public.crear_empresa(text, text) to authenticated;
grant execute on function public.fichar(text, text, double precision, double precision) to service_role;
