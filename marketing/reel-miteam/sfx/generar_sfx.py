"""Genera los efectos de sonido de los reels de MiTeam por síntesis.

Uso:  python sfx/generar_sfx.py
Deja los .wav en public/sfx/. Solo necesita numpy.
"""

import wave
from pathlib import Path

import numpy as np

SR = 48000
SALIDA = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def pasabanda(x, fc, q=0.7):
    """Filtro de estado variable con frecuencia de corte que puede variar en el tiempo."""
    fc = np.broadcast_to(fc, x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    low = band = 0.0
    y = np.empty_like(x)
    for i in range(len(x)):
        low += f[i] * band
        high = x[i] - low - q * band
        band += f[i] * high
        y[i] = band
    return y


def pasabajos(x, n):
    return np.convolve(x, np.ones(n) / n, mode="same")


def reverb(x, largo=0.45, mezcla=0.18):
    t = t_(largo)
    ir = rng.standard_normal(len(t)) * np.exp(-t / (largo / 4))
    ir = pasabajos(pasabajos(ir, 24), 12)
    ir /= np.sqrt(np.sum(ir**2))
    n = len(x) + len(ir) - 1
    tam = 1 << (n - 1).bit_length()
    humedo = np.fft.irfft(np.fft.rfft(x, tam) * np.fft.rfft(ir, tam), tam)[:n]
    seco = np.pad(x, (0, len(ir) - 1))
    return seco * (1 - mezcla) + humedo * mezcla


def estereo(mono, pan):
    """pan de -1 (izquierda) a 1 (derecha); puede ser un arreglo."""
    pan = np.broadcast_to(pan, mono.shape)
    ang = (pan + 1) * np.pi / 4
    return np.stack([mono * np.cos(ang), mono * np.sin(ang)], axis=1)


def guardar(nombre, señal, pico=0.7):
    if señal.ndim == 1:
        señal = estereo(señal, 0.0)
    # fundido de 3 ms en los bordes para que no haya clics
    borde = int(0.003 * SR)
    rampa = np.linspace(0, 1, borde)[:, None]
    señal[:borde] *= rampa
    señal[-borde:] *= rampa[::-1]
    señal = señal / (np.max(np.abs(señal)) + 1e-9) * pico
    SALIDA.mkdir(parents=True, exist_ok=True)
    with wave.open(str(SALIDA / f"{nombre}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((señal * 32767).astype("<i2").tobytes())


def whoosh(dur, f_baja, f_alta, pico_en=0.45, q=0.9, pan=(-0.6, 0.6)):
    """Barrido de viento: ruido filtrado que sube y baja de tono mientras cruza de lado."""
    t = t_(dur)
    x = t / dur
    sube = np.clip(x / pico_en, 0, 1)
    baja = np.clip((x - pico_en) / (1 - pico_en), 0, 1)
    env = np.where(x < pico_en, np.sin(sube * np.pi / 2) ** 2, (1 - baja) ** 2.2)
    fc = f_baja * (f_alta / f_baja) ** env
    ruido = rng.standard_normal(len(t))
    # dos pasadas del filtro: el viento queda en su banda, sin siseo agudo
    aire = pasabanda(pasabanda(ruido, fc, q), fc, q)
    cuerpo = pasabanda(pasabanda(rng.standard_normal(len(t)), fc * 0.35, 1.4), fc * 0.35, 1.4) * 0.8
    mono = (aire + cuerpo) * env
    lado = np.interp(x, [0, 1], pan)
    par = estereo(mono, lado)
    return reverb(par[:, 0], 0.5, 0.15), reverb(par[:, 1], 0.5, 0.15)


def pop(f0, f1, dur=0.18, tau=0.04):
    t = t_(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.018)
    fase = 2 * np.pi * np.cumsum(f) / SR
    env = (1 - np.exp(-t / 0.002)) * np.exp(-t / tau)
    tono = (np.sin(fase) + 0.25 * np.sin(2 * fase)) * env
    chasquido = np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t / 0.002) * 0.15
    return reverb(tono + chasquido, 0.3, 0.12)


def tap(f=1900, dur=0.09):
    t = t_(dur)
    golpe = np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t / 0.0015) * 0.5
    tono = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012)
    cuerpo = np.sin(2 * np.pi * 320 * t) * np.exp(-t / 0.015) * 0.5
    return reverb(golpe + tono + cuerpo, 0.25, 0.1)


def clic():
    a, b = tap(2300, 0.08), tap(2700, 0.08) * 0.6
    sep = int(0.04 * SR)
    out = np.zeros(len(a) + sep + len(b))
    out[: len(a)] += a
    out[sep : sep + len(b)] += b
    return out


def campana(notas, separacion=0.09, tau=0.45):
    dur = separacion * len(notas) + 1.2
    t = t_(dur)
    out = np.zeros(len(t))
    for i, f in enumerate(notas):
        d = int(i * separacion * SR)
        tt = t[: len(t) - d]
        env = (1 - np.exp(-tt / 0.003)) * np.exp(-tt / tau)
        parcial = sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * m * 0.6) for m, a in [(1, 1), (2, 0.22), (3, 0.08), (4.2, 0.05)])
        out[d:] += parcial * env * (0.85 ** i)
    return reverb(out, 0.7, 0.22)


def marcador(trazos=3, dur=0.42):
    t = t_(dur)
    env = np.zeros(len(t))
    largo = dur / trazos
    for i in range(trazos):
        x = (t - i * largo) / largo
        env += np.where((x > 0) & (x < 1), np.sin(np.clip(x, 0, 1) * np.pi) ** 1.5, 0)
    textura = 1 + 0.5 * np.sin(2 * np.pi * 38 * t + rng.uniform(0, 6))
    fc = 2600 + 900 * np.sin(2 * np.pi * 7 * t)
    rasgueo = pasabanda(pasabanda(rng.standard_normal(len(t)), fc, 1.2), fc, 1.2)
    return rasgueo * env * textura


def destello(n=7, dur=0.6):
    t = t_(dur + 0.3)
    izq = np.zeros(len(t))
    der = np.zeros(len(t))
    for i in range(n):
        inicio = int((i / n) * dur * SR * rng.uniform(0.85, 1.0))
        f = rng.uniform(3200, 6800)
        tt = t[: len(t) - inicio]
        ping = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.06) * (1 - i / (n + 2))
        lado = rng.uniform(-0.8, 0.8)
        ang = (lado + 1) * np.pi / 4
        izq[inicio:] += ping * np.cos(ang)
        der[inicio:] += ping * np.sin(ang)
    return np.stack([reverb(izq, 0.6, 0.3), reverb(der, 0.6, 0.3)], axis=1)


def golpe_suave():
    t = t_(0.25)
    f = 90 + 90 * np.exp(-t / 0.03)
    tono = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.06)
    ruido = pasabajos(pasabajos(rng.standard_normal(len(t)), 40), 40) * np.exp(-t / 0.02) * 4
    return reverb(tono + ruido, 0.3, 0.1)


def taza(dur=0.6):
    """Tintineo de taza de cerámica."""
    t = t_(dur)
    out = np.zeros(len(t))
    for f, a, tau in [(2650, 1.0, 0.18), (3980, 0.6, 0.12), (5310, 0.35, 0.08), (7100, 0.2, 0.05)]:
        out += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    golpe = np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t / 0.001) * 0.3
    return reverb((out + golpe) * (1 - np.exp(-t / 0.001)), 0.4, 0.2)


def papel(dur=0.55):
    """Hoja de papel que se mueve: muchos crujidos cortos."""
    t = t_(dur)
    env = np.zeros(len(t))
    for _ in range(26):
        c = rng.uniform(0, dur * 0.85)
        ancho = rng.uniform(0.004, 0.02)
        env += rng.uniform(0.3, 1.0) * np.exp(-(((t - c) / ancho) ** 2))
    env *= np.sin(np.clip(t / dur, 0, 1) * np.pi) ** 0.5
    roce = pasabanda(pasabanda(rng.standard_normal(len(t)), 2400, 1.0), 2400, 1.0)
    return reverb(roce * env, 0.3, 0.12)


def pagina(dur=0.34):
    """Página de calendario que pasa: soplido corto que baja de tono."""
    t = t_(dur)
    x = t / dur
    env = np.sin(np.clip(x, 0, 1) * np.pi) ** 1.5
    fc = 3200 * (1100 / 3200) ** x
    soplo = pasabanda(pasabanda(rng.standard_normal(len(t)), fc, 1.1), fc, 1.1) * env
    golpecito = np.sin(2 * np.pi * 140 * t) * np.exp(-np.clip(t - dur * 0.7, 0, None) / 0.03) * (t > dur * 0.7) * 0.4
    return reverb(soplo + golpecito, 0.3, 0.12)


def ambiente_cafe(dur=8.0):
    """Murmullo de café bajito: voces lejanas sin palabras y alguna taza."""
    t = t_(dur)
    ruido = rng.standard_normal(len(t))
    voces = pasabanda(pasabanda(ruido, 520, 1.6), 520, 1.6)
    modulacion = np.zeros(len(t))
    for _ in range(5):
        f = rng.uniform(0.25, 1.4)
        modulacion += np.sin(2 * np.pi * f * t + rng.uniform(0, 6))
    voces *= 0.6 + 0.25 * modulacion / 5
    fondo = pasabajos(pasabajos(rng.standard_normal(len(t)), 60), 60) * 0.8
    out = voces + fondo
    for c in rng.uniform(0.6, dur - 0.8, 4):
        tin = taza(0.5) * rng.uniform(0.04, 0.08)
        i = int(c * SR)
        out[i : i + len(tin)] += tin[: len(out) - i]
    izq = reverb(out, 0.8, 0.35)
    der = reverb(np.roll(out, 900), 0.8, 0.35)
    return np.stack([izq, der], axis=1)


def pluck(f, dur=0.5, brillo=1.0):
    """Nota de marimba suave: madera en vez de clic electrónico."""
    t = t_(dur)
    out = np.zeros(len(t))
    for m, a, tau in [(1, 1.0, 0.16), (4.0, 0.22 * brillo, 0.05), (10.0, 0.04 * brillo, 0.02)]:
        out += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / tau)
    golpe = pasabajos(rng.standard_normal(len(t)), 8) * np.exp(-t / 0.002) * 0.15
    return (out + golpe) * (1 - np.exp(-t / 0.0015))


def campana_suave(notas, separacion=0.12, tau=0.7, dur_extra=1.4):
    t = t_(separacion * len(notas) + dur_extra)
    out = np.zeros(len(t))
    for i, f in enumerate(notas):
        d = int(i * separacion * SR)
        tt = t[: len(t) - d]
        env = (1 - np.exp(-tt / 0.006)) * np.exp(-tt / tau)
        out[d:] += (np.sin(2 * np.pi * f * tt) + 0.08 * np.sin(4 * np.pi * f * tt)) * env * (0.9 ** i)
    return reverb(out, 0.9, 0.3)


def a_estereo(par):
    izq, der = par
    return np.stack([izq, der], axis=1)


guardar("whoosh-corto", a_estereo(whoosh(0.42, 600, 3400, 0.4, pan=(-0.4, 0.5))))
guardar("whoosh", a_estereo(whoosh(0.7, 350, 2600, 0.45, pan=(-0.7, 0.7))))
guardar("whoosh-largo", a_estereo(whoosh(1.15, 220, 1900, 0.5, q=0.7, pan=(0.6, -0.6))), pico=0.6)
guardar("pop", pop(820, 300))
guardar("pop-grave", pop(560, 170, 0.25, 0.06))
guardar("tap", tap())
guardar("clic", clic())
guardar("campana", campana([1046.5, 1567.98]))
guardar("campana-final", campana([783.99, 1174.66, 1567.98], 0.11, 0.6), pico=0.6)
guardar("marcador", marcador())
guardar("destello", destello())
guardar("golpe", golpe_suave(), pico=0.6)
guardar("taza", taza(), pico=0.55)
guardar("papel", papel(), pico=0.6)
guardar("pagina", pagina(), pico=0.6)
guardar("ambiente-cafe", ambiente_cafe(), pico=0.5)
guardar("tap-suave", reverb(pluck(784), 0.35, 0.15), pico=0.6)
dos = np.zeros(int(0.6 * SR))
p1, p2 = pluck(988, 0.5), pluck(1319, 0.5) * 0.7
dos[: len(p1)] += p1
dos[int(0.05 * SR) : int(0.05 * SR) + len(p2)] += p2[: len(dos) - int(0.05 * SR)]
guardar("clic-suave", reverb(dos, 0.35, 0.15), pico=0.6)
guardar("campana-suave", campana_suave([659.25, 987.77]), pico=0.55)
guardar("acorde-final", campana_suave([523.25, 659.25, 783.99, 1046.5], 0.13, 0.9, 1.8), pico=0.55)
print("Listo:", sorted(p.name for p in SALIDA.glob("*.wav")))
