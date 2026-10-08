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
print("Listo:", sorted(p.name for p in SALIDA.glob("*.wav")))
