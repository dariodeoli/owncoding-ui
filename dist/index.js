"use client"

// src/components/ui.jsx
import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";

// src/utils/cn.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function primerNombre(nombre = "") {
  return String(nombre ?? "").trim().split(/\s+/)[0] || "";
}

// src/utils/moneda.js
var GS_FORMATTER = new Intl.NumberFormat("es-PY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
var LIMITE_MONTO_GENERAL = 1e10;
var LIMITE_MONTO_VENTAS = 99e9;
function excedeMonto(value, limite = LIMITE_MONTO_GENERAL) {
  const texto = String(value ?? "").trim().replace(/\./g, "").replace(",", ".");
  if (!texto) return false;
  const numero = Number(texto);
  return Number.isFinite(numero) && Math.abs(numero) > limite;
}
var USD_FORMATTER = new Intl.NumberFormat("es-PY", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function formatGs(value) {
  const amount = Number(value);
  return `Gs ${GS_FORMATTER.format(Number.isFinite(amount) ? Math.round(amount) : 0)}`;
}
function formatGsInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? GS_FORMATTER.format(Number(digits)) : "";
}
function parseGsInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
var USD_INPUT_FORMATTER = new Intl.NumberFormat("es-PY", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function formatUsdInput(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const amount = Number(text);
  return Number.isFinite(amount) ? USD_INPUT_FORMATTER.format(amount) : "";
}
function parseUsdInput(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const normalized = text.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return "";
  return String(Number(normalized));
}
function formatUsd(value) {
  const amount = Number(value);
  return `USD ${USD_FORMATTER.format(Number.isFinite(amount) ? amount : 0)}`;
}
function formatMoney(value, currency = "PYG") {
  return currency === "USD" ? formatUsd(value) : formatGs(value);
}
function montoGs(value, vacio = "\u2014") {
  const amount = numeroDe(value);
  return amount === null ? vacio : formatGs(amount);
}
function montoUsd(value, vacio = "\u2014") {
  const amount = numeroDe(value);
  return amount === null ? vacio : `US$ ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
function montoTexto(value, currency = "PYG", vacio = "\u2014") {
  return currency === "USD" ? montoUsd(value, vacio) : montoGs(value, vacio);
}
function numeroDe(value) {
  if (value === null || value === void 0 || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}
function largoMaximoMonto(max = LIMITE_MONTO_GENERAL, { decimales = false } = {}) {
  const digitos = String(Math.trunc(Math.abs(Number(max) || 0))).length;
  const separadores = Math.floor((digitos - 1) / 3);
  return digitos + separadores + (decimales ? 3 : 0);
}

// src/utils/tamanos.js
var TAMANOS_CAMPO = Object.freeze({
  // Anchos recomendados (Tailwind) por tipo de dato
  moneda: "w-36",
  // Gs 12.500.000
  monedaAmplia: "w-44",
  // montos de venta (hasta 99.000.000.000)
  porcentaje: "w-24",
  // 12,5
  cantidad: "w-20",
  // 999
  anio: "w-20",
  dias: "w-24",
  fecha: "w-40",
  // 17/09/2026
  fechaHora: "w-52",
  telefono: "w-44",
  codigoPostal: "w-28",
  ip: "w-40",
  puerto: "w-24",
  documento: "w-44",
  // RUC/CI
  ciudad: "w-56"
});
function anchoParaLargo(largoMax = 0) {
  if (largoMax <= 12) return "w-28";
  if (largoMax <= 24) return "w-40";
  if (largoMax <= 40) return "w-56";
  return "w-full";
}

// src/utils/modal.js
var TAMANOS_MODAL = {
  corto: "max-w-md",
  // avisos, confirmaciones y formularios de un solo campo
  formulario: "max-w-xl",
  // formularios de una columna
  amplio: "max-w-3xl",
  // formularios de dos columnas, tablas y contenido amplio
  completo: "max-w-5xl"
  // editores y pantallas grandes
};
var TAMANO_MODAL_PREDETERMINADO = "formulario";

// src/components/Icon.jsx
import { jsx } from "react/jsx-runtime";
var PATHS = {
  // Navegación / estructura
  menu: "M3 6h18M3 12h18M3 18h18",
  back: "M19 12H5M12 19l-7-7 7-7",
  chevron: "M6 9l6 6 6-6",
  close: "M18 6L6 18M6 6l12 12",
  external: "M7 17L17 7M8 7h9v9",
  // Análisis
  chart: "M3 3v18h18M8 16V9M13 16V5M18 16v-4",
  trending: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  sparkles: "M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z",
  pulse: "M3 12h4l3-8 4 16 3-8h4",
  report: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 13h6M9 17h4",
  // Operación
  box: "M21 8l-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8",
  phone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM11 18h2",
  refresh: "M21 12a9 9 0 1 1-3-6.7M21 4v5h-5",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6",
  tag: "M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01",
  // Finanzas
  receipt: "M6 2h12v20l-3-2-3 2-3-2-3 2V2ZM10 8h4M9 12h6",
  megaphone: "M3 11v2a1 1 0 0 0 1 1h3l7 4V6L7 10H4a1 1 0 0 0-1 1ZM18 9a3 3 0 0 1 0 6",
  wallet: "M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M21 10h-5a2 2 0 0 0 0 4h5v-4Z",
  money: "M2 6h20v12H2zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M5 9h.01M19 15h.01",
  // Equipo
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.7 8a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H8a1.7 1.7 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V8a1.7 1.7 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  // Acciones
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  copy: "M9 9h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2ZM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8",
  edit: "M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  eyeOff: "M10.6 5.1A9.9 9.9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-2.4 3.2M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20M9.9 9.9a3 3 0 0 0 4.2 4.2",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  filter: "M22 3H2l8 9.5V19l4 2v-8.5L22 3Z",
  check: "M20 6L9 17l-5-5",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16v-4M12 8h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  unlock: "M5 11h14v10H5zM9 11V7a4 4 0 0 1 7.7-1.5",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
  truck: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8ZM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z",
  store: "M3 9 4.5 4h15L21 9M3 9h18M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M9 21v-6h6v6",
  printer: "M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  dots: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  package: "M16.5 9.4 7.5 4.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  cart: "M2.5 3h1.6l2.2 10.4a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L19.5 7H6M9 19.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM18 19.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
};
function Icon({ name, className, ...props }) {
  const d = PATHS[name];
  if (!d) return null;
  return /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.75",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: cn("h-4 w-4 shrink-0", className),
      "aria-hidden": "true",
      ...props,
      children: d.split("M").filter(Boolean).map((seg, i) => /* @__PURE__ */ jsx("path", { d: "M" + seg }, i))
    }
  );
}

// src/components/ui.jsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var VARIANTS = {
  primary: "bg-fono text-onbrand hover:bg-fono-light",
  success: "bg-ok text-black hover:brightness-110",
  danger: "bg-bad text-fore hover:brightness-110",
  outline: "bg-transparent text-fore border border-ink-500 hover:border-fono hover:bg-fono/10",
  ghost: "bg-transparent text-mute hover:bg-ink-700 hover:text-fore"
};
function Button({ className, variant = "primary", ...props }) {
  return /* @__PURE__ */ jsx2(
    "button",
    {
      className: cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 font-semibold transition",
        "h-11 md:h-9 text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-[.98]",
        VARIANTS[variant],
        className
      ),
      ...props
    }
  );
}
var Input = forwardRef(function Input2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx2(
    "input",
    {
      ref,
      className: cn(
        "w-full rounded-lg border border-ink-500 bg-ink-800 px-3.5 text-fore",
        "h-11 md:h-9 text-base md:text-sm outline-none transition",
        "focus:border-fono focus:ring-1 focus:ring-fono/40 placeholder:text-mute/60",
        className
      ),
      ...props
    }
  );
});
function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx2(Input, { ...props, type: visible ? "text" : "password", className: cn("pr-11", className) }),
    /* @__PURE__ */ jsx2(
      "button",
      {
        type: "button",
        onClick: () => setVisible((current) => !current),
        className: "absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-mute transition hover:text-fore focus-visible:z-10",
        "aria-label": visible ? "Ocultar contrase\xF1a" : "Mostrar contrase\xF1a",
        "aria-pressed": visible,
        title: visible ? "Ocultar contrase\xF1a" : "Mostrar contrase\xF1a",
        children: /* @__PURE__ */ jsx2(Icon, { name: visible ? "eyeOff" : "eye", className: "h-4 w-4" })
      }
    )
  ] });
}
function PinInput({ value, onChange, onComplete, length = 4, autoFocus = false, disabled = false, inputRef, ariaLabel, className, id }) {
  const largoMax = Math.min(6, Math.max(4, Number(length) || 4));
  const largo = String(value || "").length;
  return /* @__PURE__ */ jsxs("span", { className: cn("relative mx-auto block h-16 w-44 transition-transform duration-150 focus-within:scale-[1.03]", disabled && "opacity-50", className), children: [
    /* @__PURE__ */ jsx2(
      "input",
      {
        ref: inputRef,
        id,
        type: "text",
        inputMode: "numeric",
        autoComplete: "one-time-code",
        maxLength: largoMax,
        value,
        autoFocus,
        disabled,
        onChange: (event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, largoMax);
          onChange(next);
          if (next.length === largoMax) onComplete?.();
        },
        placeholder: "",
        "aria-label": ariaLabel || `PIN de ${largoMax} d\xEDgitos`,
        className: "pin-oculto h-full w-full rounded-2xl border border-ink-500 bg-paper text-center text-3xl font-bold tracking-[.45em] shadow-card transition-all duration-150 focus:border-fono focus:ring-2 focus:ring-fono/30 focus:outline-none"
      }
    ),
    /* @__PURE__ */ jsx2("span", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 flex items-center justify-center gap-[.5em]", children: Array.from({ length: largoMax }, (_, indice) => /* @__PURE__ */ jsx2(
      "span",
      {
        className: cn("h-2.5 w-2.5 rounded-full transition-colors", indice < largo ? "bg-fore" : "bg-mute/25")
      },
      indice
    )) })
  ] });
}
var MONEY_SYMBOL = { PYG: "Gs.", USD: "US$", BRL: "R$", EUR: "\u20AC", USDT: "USDT" };
function MoneyInput({ currency = "PYG", symbol, value, onValueChange, className, max = LIMITE_MONTO_GENERAL, maxLength, ...props }) {
  const isPyg = currency === "PYG";
  const prefix = symbol || MONEY_SYMBOL[currency] || currency;
  const display = isPyg ? formatGsInput(value) : formatUsdInput(value);
  const excede = excedeMonto(value, max);
  const topeLargo = maxLength ?? largoMaximoMonto(max, { decimales: !isPyg });
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx2("span", { className: "pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-xs font-semibold text-mute", children: prefix }),
    /* @__PURE__ */ jsx2(
      Input,
      {
        ...props,
        "aria-invalid": excede || void 0,
        title: excede ? `El monto supera el m\xE1ximo permitido (${max.toLocaleString("es-PY")})` : props.title,
        inputMode: isPyg ? "numeric" : "decimal",
        maxLength: topeLargo,
        value: display,
        onChange: (event) => {
          const next = event.target.value.replace(/[^\d.,]/g, "");
          onValueChange?.(isPyg ? next.trim() ? parseGsInput(next) : "" : parseUsdInput(next));
        },
        className: cn(TAMANOS_CAMPO.moneda, prefix.length > 3 ? "pl-14" : "pl-12", "tabular-nums", className)
      }
    )
  ] });
}
function Money({ value, currency = "PYG", className }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return /* @__PURE__ */ jsx2("span", { className, children: "\u2014" });
  return /* @__PURE__ */ jsx2("span", { className, children: currency === "USD" ? `US$ ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : formatGs(amount) });
}
function Select({ className, children, ...props }) {
  return /* @__PURE__ */ jsx2(
    "select",
    {
      className: cn(
        "w-full rounded-lg border border-ink-500 bg-ink-800 px-3 text-fore",
        "h-11 md:h-9 text-base md:text-sm outline-none transition cursor-pointer",
        "focus:border-fono focus:ring-1 focus:ring-fono/40",
        "[&>option]:bg-ink-800 [&>option]:text-fore",
        className
      ),
      ...props,
      children
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "textarea",
    {
      className: cn(
        "w-full rounded-lg border border-ink-500 bg-ink-800 px-3.5 py-2.5 text-fore",
        "text-base md:text-sm outline-none transition focus:border-fono focus:ring-1 focus:ring-fono/40",
        "placeholder:text-mute/60 resize-none",
        className
      ),
      ...props
    }
  );
}
function Label({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "label",
    {
      className: cn(
        "block text-[11px] font-medium uppercase tracking-wider text-mute mb-1.5",
        className
      ),
      ...props
    }
  );
}
function Eyebrow({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "div",
    {
      className: cn("text-xs font-bold uppercase tracking-[.18em] text-fono-light", className),
      ...props
    }
  );
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx2("div", { className: cn("rounded-xl border border-fono/30 bg-ink-800 p-5", className), ...props });
}
function Modal({ open, onClose, title, children, className, size = TAMANO_MODAL_PREDETERMINADO }) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return void 0;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close.current?.();
      if (e.key !== "Tab") return;
      const nodes = [...dialog.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []].filter((el) => el.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsx2("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6", onMouseDown: (e) => e.target === e.currentTarget && onClose?.(), children: /* @__PURE__ */ jsxs("div", { ref: dialog, tabIndex: -1, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, className: cn("max-h-[min(90dvh,720px)] w-full overflow-y-auto rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-2xl sm:p-6", TAMANOS_MODAL[size] || TAMANOS_MODAL[TAMANO_MODAL_PREDETERMINADO], className), children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx2("h2", { id: titleId, className: "text-base font-bold text-fore", children: title }),
      /* @__PURE__ */ jsx2("button", { type: "button", onClick: onClose, className: "rounded-lg p-2 text-mute hover:bg-ink-700 hover:text-fore", "aria-label": "Cerrar", children: "\xD7" })
    ] }),
    children
  ] }) });
}
function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = "Confirmar acci\xF3n",
  description,
  confirmLabel = "Confirmar",
  variant = "primary",
  busy = false
}) {
  return /* @__PURE__ */ jsx2(Modal, { open, onClose: busy ? void 0 : onCancel, title, size: "corto", children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsx2("div", { className: cn("flex h-11 w-11 items-center justify-center rounded-2xl", variant === "danger" ? "bg-bad/10 text-bad" : "bg-fono/10 text-fono-light"), children: /* @__PURE__ */ jsx2(Icon, { name: variant === "danger" ? "alert" : "check", className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsx2("p", { className: "text-sm leading-6 text-mute", children: description }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
      /* @__PURE__ */ jsx2(Button, { type: "button", variant: "ghost", onClick: onCancel, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx2(Button, { type: "button", variant, onClick: onConfirm, disabled: busy, children: busy ? "Procesando\u2026" : confirmLabel })
    ] })
  ] }) });
}
var BADGE = {
  blue: "bg-fono/15 text-fono-light border-fono/25",
  green: "bg-ok/15 text-ok border-ok/25",
  red: "bg-bad/15 text-bad border-bad/25",
  orange: "bg-warn/15 text-warn border-warn/25",
  yellow: "bg-warn/15 text-warn border-warn/25",
  slate: "bg-ink-600 text-mute border-ink-500"
};
function Badge({ className, color = "slate", ...props }) {
  return /* @__PURE__ */ jsx2(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        BADGE[color],
        className
      ),
      ...props
    }
  );
}
var DOT = { green: "bg-ok", red: "bg-bad", blue: "bg-fono", slate: "bg-mute", orange: "bg-warn" };
function Dot({ color = "slate", pulse = false, className }) {
  return /* @__PURE__ */ jsxs("span", { className: cn("relative inline-flex h-2 w-2 shrink-0", className), children: [
    pulse && /* @__PURE__ */ jsx2(
      "span",
      {
        className: cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          DOT[color]
        )
      }
    ),
    /* @__PURE__ */ jsx2("span", { className: cn("relative inline-flex h-2 w-2 rounded-full", DOT[color]) })
  ] });
}
var ICON_ACTION_TONE = {
  ok: "border-ok/30 text-ok hover:bg-ok/10",
  warn: "border-warn/30 text-warn hover:bg-warn/10",
  fono: "border-fono/30 text-fono-light hover:bg-fono/10",
  bad: "border-bad/30 text-bad hover:bg-bad/10",
  mute: "border-transparent text-mute hover:bg-ink-700 hover:text-fore"
};
function IconAction({ icon, label, tone = "mute", onClick, disabled = false }) {
  return /* @__PURE__ */ jsx2(
    "button",
    {
      type: "button",
      title: label,
      "aria-label": label,
      disabled,
      onClick,
      className: cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-lg border transition active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        ICON_ACTION_TONE[tone]
      ),
      children: /* @__PURE__ */ jsx2(Icon, { name: icon, className: "h-4 w-4" })
    }
  );
}
function Drawer({ open, onClose, title, children, side = "right", className }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return void 0;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close.current?.();
      if (e.key !== "Tab") return;
      const nodes = [...panel.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []].filter((el) => el.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsx2("div", { className: "fixed inset-0 z-50 bg-black/60", onMouseDown: (e) => e.target === e.currentTarget && onClose?.(), children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref: panel,
      tabIndex: -1,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      className: cn(
        "absolute inset-y-0 flex max-h-full w-full max-w-md flex-col overflow-hidden border-ink-600 bg-ink-800 shadow-2xl",
        side === "left" ? "left-0 border-r" : "right-0 border-l",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-ink-600 p-4", children: [
          /* @__PURE__ */ jsx2("h2", { id: titleId, className: "text-base font-bold text-fore", children: title }),
          /* @__PURE__ */ jsx2("button", { type: "button", onClick: onClose, className: "rounded-lg p-2 text-mute hover:bg-ink-700 hover:text-fore", "aria-label": "Cerrar", children: "\xD7" })
        ] }),
        /* @__PURE__ */ jsx2("div", { className: "flex-1 overflow-y-auto p-4 sm:p-5", children })
      ]
    }
  ) });
}
var ToastContext = createContext(null);
var toastCounter = 0;
var TOAST_ICON = { success: "check", error: "alert", info: "info" };
var TOAST_TONE = { success: "text-ok", error: "text-bad", info: "text-fono-light" };
function ToastProvider({ children, demo = false }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast2) => toast2.id !== id)), []);
  const toast = useCallback((variant, title, description) => {
    const id = `toast-${++toastCounter}`;
    setToasts((current) => [...current, { id, variant: TOAST_ICON[variant] ? variant : "info", title, description }]);
    setTimeout(() => dismiss(id), 4e3);
  }, [dismiss]);
  useEffect(() => {
    if (!demo) return void 0;
    let ultimo = 0;
    const aviso = () => {
      const ahora = Date.now();
      if (ahora - ultimo < 2500) return;
      ultimo = ahora;
      toast("info", "Cambio simulado en la demo", "El dato qued\xF3 solo en este navegador: no se guard\xF3 en la tienda real.");
    };
    window.addEventListener("mobos:demo-guardado", aviso);
    return () => window.removeEventListener("mobos:demo-guardado", aviso);
  }, [demo, toast]);
  const value = useMemo(() => ({
    success: (title, description) => toast("success", title, description),
    error: (title, description) => toast("error", title, description),
    info: (title, description) => toast("info", title, description)
  }), [toast]);
  if (!mounted) return children;
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value, children: [
    children,
    /* @__PURE__ */ jsx2("div", { className: "pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex max-w-sm flex-col gap-2 sm:left-auto sm:w-full", "aria-live": "polite", role: "status", children: toasts.map((toast2) => /* @__PURE__ */ jsxs("div", { className: cn("pointer-events-auto flex items-start gap-3 rounded-xl border bg-ink-700 p-3.5 shadow-card", toast2.variant === "error" ? "border-bad/40" : toast2.variant === "success" ? "border-ok/40" : "border-ink-500"), children: [
      /* @__PURE__ */ jsx2(Icon, { name: TOAST_ICON[toast2.variant], className: cn("mt-0.5 h-4 w-4", TOAST_TONE[toast2.variant]) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx2("p", { className: "text-sm font-semibold text-fore", children: toast2.title }),
        toast2.description && /* @__PURE__ */ jsx2("p", { className: "mt-0.5 text-xs text-mute", children: toast2.description }),
        demo && /* @__PURE__ */ jsx2("p", { className: "mt-1 inline-flex rounded border border-fono/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fono-light", children: "Demo \xB7 no se guard\xF3 en la tienda" })
      ] }),
      /* @__PURE__ */ jsx2("button", { type: "button", onClick: () => dismiss(toast2.id), className: "rounded-md p-1 text-mute transition hover:bg-ink-600 hover:text-fore", "aria-label": "Cerrar aviso", children: "\xD7" })
    ] }, toast2.id)) })
  ] });
}
function useToast() {
  const context = useContext(ToastContext);
  if (!context) return { success: () => {
  }, error: () => {
  }, info: () => {
  } };
  return context;
}
function Skeleton({ className }) {
  return /* @__PURE__ */ jsx2("div", { className: cn("animate-pulse rounded-lg bg-fore/5", className), "aria-hidden": "true" });
}
function EmptyState({ icon = "box", title, description, action, compact = false, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center px-6 text-center", compact ? "py-6" : "py-12", className), children: [
    /* @__PURE__ */ jsx2("div", { className: "grid h-12 w-12 place-items-center rounded-2xl border border-ink-500 bg-ink-700 text-mute", children: /* @__PURE__ */ jsx2(Icon, { name: icon, className: "h-5 w-5" }) }),
    title && /* @__PURE__ */ jsx2("p", { className: "mt-3 text-sm font-semibold text-fore", children: title }),
    description && /* @__PURE__ */ jsx2("p", { className: "mt-1 max-w-xs text-xs leading-5 text-mute", children: description }),
    action && /* @__PURE__ */ jsx2("div", { className: "mt-4", children: action })
  ] });
}
function ErrorState({ title = "Algo sali\xF3 mal", description, onRetry }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center px-6 py-12 text-center", children: [
    /* @__PURE__ */ jsx2("div", { className: "grid h-12 w-12 place-items-center rounded-2xl border border-bad/25 bg-bad/10 text-bad", children: /* @__PURE__ */ jsx2(Icon, { name: "alert", className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsx2("p", { className: "mt-3 text-sm font-semibold text-fore", children: title }),
    description && /* @__PURE__ */ jsx2("p", { className: "mt-1 max-w-xs text-xs leading-5 text-mute", children: description }),
    onRetry && /* @__PURE__ */ jsx2(Button, { type: "button", variant: "outline", onClick: onRetry, className: "mt-4", children: "Reintentar" })
  ] });
}
var AVISOS = {
  error: "border-bad/30 bg-bad/10 text-bad",
  ok: "border-ok/30 bg-ok/10 text-ok",
  warn: "border-warn/30 bg-warn/10 text-warn"
};
function Aviso({ tono = "error", como = "p", compact = false, className, children, ...props }) {
  const Etiqueta = como === "div" ? "div" : "p";
  return /* @__PURE__ */ jsx2(
    Etiqueta,
    {
      role: tono === "error" ? "alert" : "status",
      className: cn("rounded-lg border", compact ? "px-2.5 py-2 text-xs" : "px-3 py-2 text-sm", AVISOS[tono], className),
      ...props,
      children
    }
  );
}
function PageHeader({ title, subtitle, actions, backTo, eyebrow }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
      backTo && /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          onClick: backTo,
          className: "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-500 text-mute transition hover:border-fono hover:bg-fono/10 hover:text-fore",
          "aria-label": "Volver",
          children: /* @__PURE__ */ jsx2(Icon, { name: "back", className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        eyebrow && /* @__PURE__ */ jsx2(Eyebrow, { children: eyebrow }),
        /* @__PURE__ */ jsx2("h1", { className: "truncate text-2xl font-bold", children: title }),
        subtitle && /* @__PURE__ */ jsx2("p", { className: "mt-1 truncate text-sm text-mute", children: subtitle })
      ] })
    ] }),
    actions && /* @__PURE__ */ jsx2("div", { className: "flex shrink-0 flex-wrap items-center gap-2", children: actions })
  ] });
}
function DataTable({ columns, rows, emptyLabel = "Sin datos para mostrar.", loading = false, mobileCard, className }) {
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: cn("space-y-2 p-4", className), "aria-busy": "true", children: [
      /* @__PURE__ */ jsx2(Skeleton, { className: "h-4 w-1/3" }),
      /* @__PURE__ */ jsx2(Skeleton, { className: "h-10 w-full" }),
      /* @__PURE__ */ jsx2(Skeleton, { className: "h-10 w-full" }),
      /* @__PURE__ */ jsx2(Skeleton, { className: "h-10 w-full" })
    ] });
  }
  if (!rows?.length) return /* @__PURE__ */ jsx2(EmptyState, { title: emptyLabel, description: "", className });
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx2("div", { className: "hidden max-h-[70vh] overflow-auto md:block", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx2("thead", { className: "sticky top-0 z-10 bg-ink-800", children: /* @__PURE__ */ jsx2("tr", { className: "border-b border-ink-600 text-left text-xs uppercase tracking-wider text-mute", children: columns.map((column) => /* @__PURE__ */ jsx2("th", { className: cn("px-2.5 py-1.5 font-medium", column.align === "right" && "text-right", column.align === "center" && "text-center"), children: column.label }, column.key)) }) }),
      /* @__PURE__ */ jsx2("tbody", { children: rows.map((row) => /* @__PURE__ */ jsx2("tr", { className: "border-b border-ink-600/60 last:border-0", children: columns.map((column) => /* @__PURE__ */ jsx2("td", { className: cn("px-2.5 py-1.5 text-fore", column.align === "right" && "text-right", column.align === "center" && "text-center"), children: column.render ? column.render(row) : row[column.key] }, column.key)) }, row.id ?? row.key ?? JSON.stringify(row))) })
    ] }) }),
    /* @__PURE__ */ jsx2("div", { className: "grid grid-cols-1 gap-2 p-2.5 md:hidden", children: mobileCard ? rows.map((row) => /* @__PURE__ */ jsx2("div", { children: mobileCard(row) }, row.id ?? row.key ?? JSON.stringify(row))) : /* @__PURE__ */ jsx2(EmptyState, { icon: "filter", title: emptyLabel }) })
  ] });
}
function FormField({ label, hint, error, children, htmlFor }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    label && /* @__PURE__ */ jsx2(Label, { htmlFor, children: label }),
    children,
    error ? /* @__PURE__ */ jsx2("p", { role: "alert", className: "mt-1.5 text-xs text-bad", children: error }) : hint ? /* @__PURE__ */ jsx2("p", { className: "mt-1.5 text-xs text-mute", children: hint }) : null
  ] });
}
function Stat({ label, valor, delta, sub, destacado = false, className }) {
  const sube = typeof delta === "number" && delta >= 0;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative overflow-hidden rounded-xl border p-4",
        destacado ? "border-fono/30 bg-gradient-to-br from-fono-dark via-fono to-fono" : "border-ink-600 bg-ink-800",
        className
      ),
      children: [
        /* @__PURE__ */ jsx2("div", { className: cn("text-[11px] font-medium uppercase tracking-wider", destacado ? "text-onbrand/75" : "text-mute"), children: label }),
        /* @__PURE__ */ jsx2("div", { className: cn("mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl", destacado ? "text-onbrand" : "text-fore"), children: valor }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-2 text-xs", children: [
          typeof delta === "number" && /* @__PURE__ */ jsxs("span", { className: cn("font-medium", sube ? "text-ok" : "text-bad"), children: [
            sube ? "" : "",
            " ",
            Math.abs(delta).toFixed(1),
            "%"
          ] }),
          sub && /* @__PURE__ */ jsx2("span", { className: destacado ? "text-onbrand/75" : "text-mute", children: sub })
        ] })
      ]
    }
  );
}
function Subtabs({ value, onChange, items = [], className }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsx2("div", { className: cn("mb-5 flex flex-wrap gap-2 rounded-2xl border border-fore/10 bg-ink p-2", className), role: "tablist", children: items.map(([id, label]) => /* @__PURE__ */ jsx2(
    "button",
    {
      type: "button",
      role: "tab",
      "aria-selected": value === id,
      onClick: () => onChange(id),
      className: cn(
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        value === id ? "bg-fono text-onbrand" : "text-mute hover:bg-fore/5 hover:text-fore"
      ),
      children: label
    },
    id
  )) });
}
var TONOS_VALOR = { ok: "text-ok", warn: "text-warn", bad: "text-bad", mute: "text-mute" };
function FilaDato({ etiqueta, valor, tono = "", etiquetaComo: Etiqueta = "span", valorComo: Valor = "span", className, valorClassName, children }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center justify-between gap-3", className), children: [
    /* @__PURE__ */ jsx2(Etiqueta, { className: "min-w-0 text-mute", children: etiqueta ?? children }),
    /* @__PURE__ */ jsx2(Valor, { className: cn("shrink-0 font-semibold tabular-nums", TONOS_VALOR[tono], valorClassName), children: valor })
  ] });
}
function CeldaMoneda({ valor, tono = "", currency = "PYG", className, children }) {
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex shrink-0 items-center justify-end gap-1 font-semibold tabular-nums", TONOS_VALOR[tono], className), children: [
    /* @__PURE__ */ jsx2(Money, { value: Number(valor || 0), currency }),
    children
  ] });
}
var TONOS_BARRA = { fono: "bg-fono", ok: "bg-ok", warn: "bg-warn", bad: "bg-bad", mute: "bg-mute" };
var ALTURAS_BARRA = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };
function BarraProgreso({ valor = 0, max = 100, tono = "fono", alto = "md", etiqueta, className }) {
  const total = Number(max) > 0 ? Number(max) : 100;
  const porcentaje = Math.min(100, Math.max(0, (Number(valor) || 0) / total * 100));
  return /* @__PURE__ */ jsx2(
    "div",
    {
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": Math.round(porcentaje),
      "aria-label": etiqueta,
      className: cn("overflow-hidden rounded-full bg-fore/10", ALTURAS_BARRA[alto] || ALTURAS_BARRA.md, className),
      children: /* @__PURE__ */ jsx2("span", { className: cn("block h-full rounded-full transition-[width] duration-500 ease-out", TONOS_BARRA[tono] || TONOS_BARRA.fono), style: { width: `${porcentaje}%` } })
    }
  );
}

// src/components/Switch.jsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function Switch({ checked, onChange, disabled = false, id, ariaLabel, className, ...props }) {
  return /* @__PURE__ */ jsxs2("span", { className: cn("relative inline-flex h-5 w-9 shrink-0 items-center", className), children: [
    /* @__PURE__ */ jsx3(
      "input",
      {
        id,
        type: "checkbox",
        role: "switch",
        "aria-checked": Boolean(checked),
        "aria-label": ariaLabel,
        checked: Boolean(checked),
        disabled,
        onChange,
        className: "peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed",
        ...props
      }
    ),
    /* @__PURE__ */ jsx3(
      "span",
      {
        "aria-hidden": "true",
        className: cn(
          "pointer-events-none absolute inset-0 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-fono/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper",
          checked ? "border-fono bg-fono" : "border-ink-500 bg-ink-600",
          disabled && "opacity-50"
        )
      }
    ),
    /* @__PURE__ */ jsx3(
      "span",
      {
        "aria-hidden": "true",
        className: cn(
          "pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-4"
        )
      }
    )
  ] });
}

// src/components/SearchField.jsx
import { forwardRef as forwardRef2 } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var SearchField = forwardRef2(function SearchField2({ value = "", onChange, onClear, placeholder, ariaLabel, className, disabled = false, ...props }, ref) {
  function limpiar() {
    if (onClear) onClear();
    else onChange?.({ target: { value: "" } });
  }
  return /* @__PURE__ */ jsxs3("div", { className: cn("relative min-w-0", className), children: [
    /* @__PURE__ */ jsx4(Icon, { name: "search", className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx4(
      Input,
      {
        ref,
        value,
        onChange,
        placeholder,
        "aria-label": ariaLabel || placeholder,
        disabled,
        className: "pl-9 pr-9",
        ...props
      }
    ),
    value ? /* @__PURE__ */ jsx4(
      "button",
      {
        type: "button",
        onClick: limpiar,
        disabled,
        className: "absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-mute transition hover:bg-ink-700 hover:text-fore disabled:opacity-40",
        "aria-label": "Limpiar b\xFAsqueda",
        title: "Limpiar b\xFAsqueda",
        children: /* @__PURE__ */ jsx4(Icon, { name: "close", className: "h-3.5 w-3.5" })
      }
    ) : null
  ] });
});
var SearchField_default = SearchField;

// src/components/BotonDentroCampo.jsx
import { Fragment, jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function BotonDentroCampo({
  etiqueta,
  titulo: titulo2,
  etiquetaOcupada = "Consultando\u2026",
  icono = "search",
  ocupado = false,
  disabled = false,
  onClick,
  className = ""
}) {
  return /* @__PURE__ */ jsx5(
    "button",
    {
      type: "button",
      onClick,
      disabled: disabled || ocupado,
      "aria-label": ocupado ? etiquetaOcupada : etiqueta,
      "aria-busy": ocupado || void 0,
      title: ocupado ? etiquetaOcupada : titulo2 || etiqueta,
      className: cn(
        "absolute inset-y-0 right-0 flex items-center rounded-r-lg text-mute transition hover:text-fore focus-visible:z-10",
        "disabled:cursor-not-allowed disabled:opacity-40",
        ocupado ? "gap-2 bg-ink-700 px-3 text-xs font-semibold text-fono-light" : "w-11 justify-center",
        className
      ),
      children: ocupado ? /* @__PURE__ */ jsxs4(Fragment, { children: [
        /* @__PURE__ */ jsx5("span", { "aria-hidden": "true", className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-500 border-t-fono-light" }),
        etiquetaOcupada
      ] }) : /* @__PURE__ */ jsx5(Icon, { name: icono, className: "h-4 w-4" })
    }
  );
}

// src/components/SegmentedField.jsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function SegmentedField({ value, onChange, options = [], ariaLabel, className }) {
  if (!options.length) return null;
  return /* @__PURE__ */ jsx6("div", { className: cn("flex flex-wrap gap-1 rounded-xl border border-ink-600 bg-ink-800 p-1", className), role: "group", "aria-label": ariaLabel, children: options.map(([id, label, icon, contador]) => {
    const activo = value === id;
    return /* @__PURE__ */ jsxs5(
      "button",
      {
        type: "button",
        "aria-pressed": activo,
        "aria-label": contador === void 0 ? label : `${label} (${contador})`,
        title: label,
        onClick: () => onChange(id),
        className: cn(
          "inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
          activo ? "bg-fono/15 text-fono-light" : "text-mute hover:bg-fore/5 hover:text-fore"
        ),
        children: [
          icon && /* @__PURE__ */ jsx6(Icon, { name: icon, className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx6("span", { className: "min-w-0 truncate", children: label }),
          contador !== void 0 && /* @__PURE__ */ jsx6("span", { className: "text-xs opacity-75", children: contador })
        ]
      },
      id
    );
  }) });
}

// src/components/PercentField.jsx
import { jsx as jsx7 } from "react/jsx-runtime";
function parsePercent(valor) {
  const texto = String(valor ?? "").trim().replace(",", ".");
  if (texto === "" || texto === ".") return null;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}
function formatPercent(valor) {
  if (valor === null || valor === void 0 || valor === "") return "";
  const numero = Number(String(valor).replace(",", "."));
  if (!Number.isFinite(numero)) return "";
  return String(Math.round(numero * 100) / 100).replace(".", ",");
}
function limpiarPercent(valor, max = 100) {
  const texto = String(valor ?? "").replace(/\./g, ",").replace(/[^\d,]/g, "");
  const [entera = "", ...resto] = texto.split(",");
  const digitos = entera.slice(0, String(max).length);
  if (!resto.length) return digitos.slice(0, 6);
  return `${digitos},${resto.join("").slice(0, 2)}`.slice(0, 6);
}
function PercentField({
  value = "",
  onChange,
  disabled = false,
  placeholder = "0",
  max = 100,
  className,
  id,
  ...props
}) {
  return /* @__PURE__ */ jsx7(
    Input,
    {
      id,
      className: cn(TAMANOS_CAMPO.porcentaje, className),
      type: "text",
      inputMode: "decimal",
      autoComplete: "off",
      maxLength: 6,
      disabled,
      placeholder,
      ...props,
      value: limpiarPercent(value, max),
      onChange: (event) => onChange?.(limpiarPercent(event.target.value, max))
    }
  );
}

// src/components/CurrencySelect.jsx
import { jsx as jsx8 } from "react/jsx-runtime";
var MONEDAS = [
  ["PYG", "PYG \xB7 Gs"],
  ["USD", "USD \xB7 D\xF3lares"],
  ["BRL", "BRL \xB7 Reales"],
  ["EUR", "EUR \xB7 Euros"],
  ["USDT", "USDT \xB7 Tether"]
];
function CurrencySelect({ value, onChange, className, excluir = [], ...props }) {
  const monedas = MONEDAS.filter(([code]) => !excluir.includes(code));
  return /* @__PURE__ */ jsx8(Select, { value, onChange, className, ...props, children: monedas.map(([code, label]) => /* @__PURE__ */ jsx8("option", { value: code, children: label }, code)) });
}

// src/components/ListGridToggle.jsx
import { jsx as jsx9 } from "react/jsx-runtime";
var OPTIONS = [
  { key: "list", icon: "list", label: "Ver como lista" },
  { key: "grid", icon: "grid", label: "Ver como cuadr\xEDcula" }
];
function ListGridToggle({ value, onChange, className }) {
  return /* @__PURE__ */ jsx9("div", { className: cn("flex overflow-hidden rounded-lg border border-ink-600 bg-ink-800", className), role: "group", "aria-label": "Cambiar vista", children: OPTIONS.map((option) => /* @__PURE__ */ jsx9(
    "button",
    {
      type: "button",
      title: option.label,
      "aria-label": option.label,
      "aria-pressed": value === option.key,
      onClick: () => onChange(option.key),
      className: cn("grid h-9 w-9 place-items-center transition", value === option.key ? "bg-fono/15 text-fono-light" : "text-mute hover:text-fore"),
      children: /* @__PURE__ */ jsx9(Icon, { name: option.icon, className: "h-4 w-4" })
    },
    option.key
  )) });
}

// src/components/EmailField.jsx
import { useRef as useRef2, useState as useState2 } from "react";
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
var DOMINIOS_EMAIL = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "hotmail.es",
  "outlook.es"
];
var MAX_SUGERENCIAS = 4;
function sugerenciasDe(value, dominios = DOMINIOS_EMAIL, max = MAX_SUGERENCIAS) {
  const texto = String(value || "").trim();
  const arroba = texto.indexOf("@");
  const usuario = arroba === -1 ? texto : texto.slice(0, arroba);
  const dominio = arroba === -1 ? "" : texto.slice(arroba + 1).toLowerCase();
  if (!usuario) return [];
  if (dominio.includes(" ")) return [];
  const coincidencias = dominio ? dominios.filter((candidato) => candidato.startsWith(dominio) && candidato !== dominio) : dominios;
  return coincidencias.slice(0, max).map((d) => `${usuario}@${d}`);
}
function EmailField({
  value = "",
  onChange,
  disabled = false,
  placeholder = "vos@tutienda.com",
  dominios = DOMINIOS_EMAIL,
  className,
  inputClassName,
  onKeyDown,
  onBlur,
  ...props
}) {
  const [open, setOpen] = useState2(false);
  const tecleando = useRef2(false);
  const tipeoReciente = useRef2(false);
  const inputRef = useRef2(null);
  const sugerencias = sugerenciasDe(value, dominios);
  function manejarKeyDown(event) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      tecleando.current = false;
      setOpen(false);
      return;
    }
    if (event.key === "Enter") {
      if (open && sugerencias.length > 0) {
        event.preventDefault();
        elegir(sugerencias[0]);
      }
      return;
    }
    tecleando.current = true;
    tipeoReciente.current = true;
  }
  function manejarChange(event) {
    onChange?.(event.target.value);
    if (tipeoReciente.current) {
      tipeoReciente.current = false;
      setOpen(sugerenciasDe(event.target.value, dominios).length > 0);
    }
  }
  function elegir(sugerencia) {
    onChange?.(sugerencia);
    tecleando.current = false;
    setOpen(false);
    inputRef.current?.focus();
  }
  function perderFoco(event) {
    onBlur?.(event);
    tecleando.current = false;
    setOpen(false);
  }
  return /* @__PURE__ */ jsxs6("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx10(
      Input,
      {
        ...props,
        ref: inputRef,
        type: "email",
        className: cn("w-full", inputClassName),
        value,
        disabled,
        placeholder,
        onChange: manejarChange,
        onKeyDown: manejarKeyDown,
        onBlur: perderFoco
      }
    ),
    open && tecleando.current && sugerencias.length > 0 && /* @__PURE__ */ jsx10(
      "ul",
      {
        role: "listbox",
        "aria-label": "Sugerencias de correo",
        className: "absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-ink-500 bg-paper shadow-xl",
        children: sugerencias.map((sugerencia) => /* @__PURE__ */ jsx10("li", { children: /* @__PURE__ */ jsx10(
          "button",
          {
            type: "button",
            className: "w-full px-3 py-2 text-left text-sm text-fore transition hover:bg-ink-700",
            onMouseDown: (event) => event.preventDefault(),
            onClick: () => elegir(sugerencia),
            children: sugerencia
          }
        ) }, sugerencia))
      }
    )
  ] });
}

// src/components/PhoneField.jsx
import { useState as useState3 } from "react";

// src/utils/telefono.js
function normalizarTelefono(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}
function internationalPhone(value, countryCode = "+595") {
  let digits = String(value || "").replace(/\D/g, "");
  const code = String(countryCode || "+595").replace(/\D/g, "") || "595";
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(code)) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `${code}${digits}`;
}
function whatsappUrl(phone, message = "", countryCode = "+595") {
  const numero = internationalPhone(phone, countryCode);
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(String(message ?? ""))}` : "";
}
function soloDigitos(value, max = 0) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return max > 0 ? digits.slice(0, max) : digits;
}
function codigoPais(value) {
  const digits = soloDigitos(value, 4);
  return digits ? `+${digits}` : "";
}
function telefonoVisible(phone, countryCode = "+595") {
  const code = String(countryCode || "+595").replace(/\D/g, "") || "595";
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith(code)) digits = digits.slice(code.length);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits) return "";
  const local = digits.length === 9 ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : digits;
  return `+${code} ${local}`;
}
function telefonoValido(value, countryCode = "+595") {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return false;
  const code = String(countryCode || "+595").replace(/\D/g, "");
  const local = digits.startsWith(code) ? digits.slice(code.length) : digits.startsWith("0") ? digits.slice(1) : digits;
  if (code === "595") return /^9\d{8}$/.test(local);
  return local.length >= 6 && local.length <= 12;
}
var MENSAJE_TELEFONO = "Tel\xE9fono inv\xE1lido. Para Paraguay us\xE1 un m\xF3vil de 9 d\xEDgitos, ej: 981 123 456 o +595 971 234567.";

// src/components/PhoneField.jsx
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
var MAX_CODIGO = 6;
var MAX_NUMERO = 30;
var CODIGOS_PAIS = ["+595", "+55", "+54", "+56", "+591", "+598", "+1", "+34", "+44", "+351"];
function soloDigitos2(value) {
  return String(value || "").replace(/\D/g, "").slice(0, MAX_CODIGO);
}
function soloNumero(value) {
  return String(value || "").replace(/[^\d\s()-]/g, "").slice(0, MAX_NUMERO);
}
function parseTelefono(value, countryCodePorDefecto = "+595") {
  const texto = String(value || "").trim();
  const partes = texto.match(/^\+(\d{1,3})\s*(.*)$/);
  if (partes) return { countryCode: `+${partes[1]}`, phone: partes[2].trim() };
  return { countryCode: countryCodePorDefecto, phone: texto };
}
function componerTelefono({ countryCode = "+595", phone = "" } = {}) {
  const numero = String(phone || "").trim().replace(/\s+/g, " ");
  if (!numero) return null;
  const codigo = String(countryCode || "").replace(/\D/g, "") || "595";
  return `+${codigo} ${numero}`;
}
function PhoneField({
  countryCode = "+595",
  phone = "",
  onChange,
  onCountryCodeChange,
  disabled = false,
  placeholder = "981 123 456",
  countryAriaLabel = "C\xF3digo de pa\xEDs",
  phoneAriaLabel = "Tel\xE9fono",
  codigos = CODIGOS_PAIS,
  mensajeInvalido = MENSAJE_TELEFONO,
  id = "telefono-codigos",
  className
}) {
  const [tocado, setTocado] = useState3(false);
  const invalido = tocado && Boolean(String(phone).trim()) && !telefonoValido(phone, countryCode);
  return /* @__PURE__ */ jsxs7("div", { className, children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx11(
        Input,
        {
          inputMode: "numeric",
          list: id,
          disabled,
          value: `+${soloDigitos2(countryCode)}`,
          onChange: (event) => onCountryCodeChange?.(`+${soloDigitos2(event.target.value)}`),
          "aria-label": countryAriaLabel,
          className: "w-[92px] shrink-0 text-center"
        }
      ),
      /* @__PURE__ */ jsx11("datalist", { id, children: codigos.map((codigo) => /* @__PURE__ */ jsx11("option", { value: codigo }, codigo)) }),
      /* @__PURE__ */ jsx11(
        Input,
        {
          type: "tel",
          inputMode: "tel",
          maxLength: MAX_NUMERO,
          disabled,
          value: phone,
          onChange: (event) => onChange?.(soloNumero(event.target.value)),
          placeholder,
          "aria-label": phoneAriaLabel,
          onBlur: () => setTocado(true),
          className: "min-w-0 flex-1"
        }
      )
    ] }),
    invalido && /* @__PURE__ */ jsx11("span", { className: "block pt-1 text-[11px] text-bad", children: mensajeInvalido })
  ] });
}

// src/components/SerialField.jsx
import { jsx as jsx12 } from "react/jsx-runtime";
function normalizarSerial(value = "") {
  return String(value ?? "").trim().replace(/[\s-]+/g, "").toUpperCase();
}
function SerialField({
  value = "",
  onChange,
  disabled = false,
  placeholder = "IMEI o serial",
  normalizar = normalizarSerial,
  maxLength = 32,
  ...props
}) {
  return /* @__PURE__ */ jsx12(
    Input,
    {
      autoCapitalize: "characters",
      autoCorrect: "off",
      spellCheck: false,
      maxLength,
      disabled,
      placeholder,
      ...props,
      value: normalizar(value),
      onChange: (event) => onChange?.(normalizar(event.target.value))
    }
  );
}

// src/components/InstagramField.jsx
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
var MAX_USERNAME = 30;
function normalizarInstagram(value) {
  const texto = String(value || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/^instagram\.com\//i, "").replace(/^@+/, "");
  return texto.split(/[/?#]/)[0].replace(/\s+/g, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, MAX_USERNAME);
}
function InstagramField({ value = "", onChange, disabled = false, placeholder = "usuario", className }) {
  return /* @__PURE__ */ jsxs8("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx13("span", { "aria-hidden": "true", className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-mute", children: "@" }),
    /* @__PURE__ */ jsx13(
      Input,
      {
        maxLength: MAX_USERNAME,
        disabled,
        value: normalizarInstagram(value),
        onChange: (event) => onChange?.(normalizarInstagram(event.target.value)),
        placeholder,
        className: "pl-8"
      }
    )
  ] });
}

// src/components/GoogleButton.jsx
import { jsx as jsx14, jsxs as jsxs9 } from "react/jsx-runtime";
function GoogleMark({ className }) {
  return /* @__PURE__ */ jsxs9("svg", { "aria-hidden": "true", viewBox: "0 0 18 18", className: cn("h-[18px] w-[18px] shrink-0", className), children: [
    /* @__PURE__ */ jsx14("path", { fill: "#EA4335", d: "M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.909c1.703-1.568 2.683-3.878 2.683-6.615Z" }),
    /* @__PURE__ */ jsx14("path", { fill: "#4285F4", d: "M9 18c2.43 0 4.467-.806 5.957-2.18l-2.91-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.037-3.71H.956v2.331A9 9 0 0 0 9 18Z" }),
    /* @__PURE__ */ jsx14("path", { fill: "#FBBC05", d: "M3.963 10.712A5.412 5.412 0 0 1 3.681 9c0-.594.102-1.171.282-1.712V4.957H.956A9 9 0 0 0 0 9c0 1.452.348 2.827.956 4.043l3.007-2.331Z" }),
    /* @__PURE__ */ jsx14("path", { fill: "#34A853", d: "M9 3.578c1.322 0 2.508.454 3.441 1.345l2.581-2.582C13.463.891 11.426 0 9 0A9 9 0 0 0 .956 4.957l3.007 2.331C4.672 5.162 6.656 3.578 9 3.578Z" })
  ] });
}
function OAuthDivider({ texto = "o", className }) {
  return /* @__PURE__ */ jsxs9("div", { className: cn("flex items-center gap-4 py-1 text-sm font-medium text-mute", className), children: [
    /* @__PURE__ */ jsx14("span", { className: "h-px flex-1 bg-fore/10" }),
    texto,
    /* @__PURE__ */ jsx14("span", { className: "h-px flex-1 bg-fore/10" })
  ] });
}
function GoogleButton({
  crear = false,
  busy = false,
  onClick,
  etiquetaCrear = "Crear con Google",
  etiquetaContinuar = "Continuar con Google",
  etiquetaBusy = "Conectando con Google\u2026",
  className
}) {
  return /* @__PURE__ */ jsxs9(
    "button",
    {
      type: "button",
      onClick,
      disabled: busy,
      "aria-busy": busy,
      className: cn(
        "group flex h-14 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-900 shadow-sm transition",
        "hover:-translate-y-px hover:border-white hover:bg-slate-50 hover:shadow-lg",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fono",
        "disabled:cursor-wait disabled:opacity-70 sm:rounded-full",
        className
      ),
      children: [
        busy ? /* @__PURE__ */ jsx14("span", { className: "h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#4285F4]" }) : /* @__PURE__ */ jsx14(GoogleMark, {}),
        /* @__PURE__ */ jsx14("span", { className: "ml-3", children: busy ? etiquetaBusy : crear ? etiquetaCrear : etiquetaContinuar })
      ]
    }
  );
}

// src/components/AuthLayout.jsx
import { jsx as jsx15, jsxs as jsxs10 } from "react/jsx-runtime";
function AuthLayout({ logo, aside, acciones, pie, children, className }) {
  return /* @__PURE__ */ jsxs10("main", { className: cn("relative flex min-h-dvh flex-col overflow-x-hidden bg-paper text-fore", className), children: [
    acciones && /* @__PURE__ */ jsx15("div", { className: "absolute right-4 top-4 z-20", children: acciones }),
    /* @__PURE__ */ jsx15("div", { "aria-hidden": true, className: "pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-fono/15 blur-3xl" }),
    /* @__PURE__ */ jsxs10("div", { className: "mx-auto grid w-full max-w-[1380px] flex-1 items-center gap-12 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-12", children: [
      /* @__PURE__ */ jsxs10("section", { className: "hidden lg:block", children: [
        logo,
        aside
      ] }),
      children
    ] }),
    pie && /* @__PURE__ */ jsx15("div", { className: "shrink-0", children: pie })
  ] });
}

// src/components/ProductFooter.jsx
import { Fragment as Fragment2, jsx as jsx16, jsxs as jsxs11 } from "react/jsx-runtime";
function ProductFooter({
  nombre = "",
  version = "",
  credito = "",
  creditoUrl = "",
  anio = (/* @__PURE__ */ new Date()).getFullYear(),
  leading,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs11("footer", { className: cn("border-t border-fore/10 bg-transparent px-4 py-3 text-center text-[11px] text-mute", className), children: [
    leading,
    /* @__PURE__ */ jsxs11("span", { children: [
      "\xA9 ",
      anio,
      " ",
      nombre,
      ". Todos los derechos reservados.",
      version ? ` \xB7 ${version}` : ""
    ] }),
    children && /* @__PURE__ */ jsxs11(Fragment2, { children: [
      " \xB7 ",
      children
    ] }),
    credito && /* @__PURE__ */ jsxs11(Fragment2, { children: [
      " \xB7 ",
      /* @__PURE__ */ jsx16("a", { href: creditoUrl, target: "_blank", rel: "noreferrer", className: "font-medium text-fono-dark hover:underline", children: credito })
    ] })
  ] });
}

// src/components/LoadingScreen.jsx
import { jsx as jsx17, jsxs as jsxs12 } from "react/jsx-runtime";
function LoadingScreen({ mensaje = "Cargando\u2026", logo, tienda = null, etiqueta = "", className }) {
  const nombreTienda = tienda?.nombre || "";
  const imagenTienda = tienda?.logo || "";
  return /* @__PURE__ */ jsxs12(
    "div",
    {
      className: cn("relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-paper px-6 text-fore", className),
      role: "status",
      "aria-busy": "true",
      "aria-label": mensaje,
      children: [
        /* @__PURE__ */ jsx17("div", { "aria-hidden": true, className: "pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-[62%] rounded-full bg-fono/20 blur-3xl" }),
        /* @__PURE__ */ jsx17("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fono/50 to-transparent" }),
        /* @__PURE__ */ jsxs12("div", { className: "relative flex w-full max-w-xs flex-col items-center", children: [
          /* @__PURE__ */ jsx17("div", { className: "drop-shadow-[0_10px_30px_rgba(12,136,118,0.25)] motion-safe:animate-[oc-respira_2.6s_ease-in-out_infinite]", children: logo }),
          /* @__PURE__ */ jsx17("p", { className: "mt-7 text-[11px] font-semibold uppercase tracking-[.22em] text-mute", children: mensaje }),
          /* @__PURE__ */ jsx17("div", { className: "mt-4 h-[3px] w-44 overflow-hidden rounded-full bg-ink-600/70", "aria-hidden": true, children: /* @__PURE__ */ jsx17("span", { className: "block h-full w-1/3 rounded-full bg-gradient-to-r from-fono/40 via-fono to-fono-light motion-safe:animate-[oc-carga_1.25s_ease-in-out_infinite]" }) })
        ] }),
        nombreTienda && /* @__PURE__ */ jsx17("div", { className: "absolute inset-x-0 bottom-8 flex justify-center px-6", children: /* @__PURE__ */ jsxs12("span", { className: "flex max-w-[22rem] items-center gap-2.5 rounded-full border border-fore/10 bg-ink-800/70 px-3 py-1.5 shadow-card backdrop-blur", children: [
          imagenTienda ? /* @__PURE__ */ jsx17("img", { src: imagenTienda, alt: "", className: "h-6 w-6 shrink-0 rounded-full object-cover", referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsx17("span", { className: "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-fono/15 text-[10px] font-bold text-fono-light", children: nombreTienda.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsx17("span", { className: "min-w-0 truncate text-xs font-semibold", children: nombreTienda }),
          etiqueta && /* @__PURE__ */ jsx17("span", { className: "shrink-0 rounded-full border border-ink-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mute", children: etiqueta })
        ] }) })
      ]
    }
  );
}

// src/components/PegarEnlaceToken.jsx
import { useState as useState4 } from "react";

// src/utils/token.js
var RUTA_CON_TOKEN = /(?:^|\/)([^/?#]+)\/([a-f0-9]{64})(?:[/?#]|$)/i;
function extractTokenFromUrl(raw = "") {
  const texto = (() => {
    try {
      return decodeURIComponent(String(raw));
    } catch {
      return String(raw);
    }
  })();
  const porRuta = texto.match(RUTA_CON_TOKEN);
  if (porRuta) return porRuta[2];
  const match = texto.match(/[a-f0-9]{64}/i);
  return match ? match[0] : "";
}
function esToken(value) {
  return /^[a-f0-9]{64}$/i.test(String(value ?? "").trim());
}

// src/components/PegarEnlaceToken.jsx
import { jsx as jsx18, jsxs as jsxs13 } from "react/jsx-runtime";
function PegarEnlaceToken({
  onToken,
  etiqueta = "Peg\xE1 tu enlace completo",
  textoBoton = "Usar este enlace",
  errorMensaje = "No encontramos el c\xF3digo en ese enlace. Peg\xE1 el enlace completo de tu correo.",
  id = "pegar-enlace",
  className
}) {
  const [enlace, setEnlace] = useState4("");
  const [error, setError] = useState4("");
  function aplicar(event) {
    event.preventDefault();
    setError("");
    const token = extractTokenFromUrl(enlace);
    if (!token) return setError(errorMensaje);
    onToken?.(token);
  }
  return /* @__PURE__ */ jsxs13("form", { onSubmit: aplicar, className: className ?? "space-y-3 rounded-xl border border-fono/25 bg-fono/5 p-4", children: [
    /* @__PURE__ */ jsxs13("div", { children: [
      /* @__PURE__ */ jsx18(Label, { htmlFor: id, children: etiqueta }),
      /* @__PURE__ */ jsx18(
        Input,
        {
          id,
          value: enlace,
          onChange: (event) => {
            setEnlace(event.target.value);
            setError("");
          },
          placeholder: "https://\u2026",
          autoComplete: "off",
          className: "mt-1.5"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx18(Aviso, { tono: "error", children: error }),
    /* @__PURE__ */ jsx18(Button, { type: "submit", disabled: !enlace.trim(), children: textoBoton })
  ] });
}

// src/components/NavLateral.jsx
import { jsx as jsx19, jsxs as jsxs14 } from "react/jsx-runtime";
function NavLateral({
  items = [],
  activeId,
  onSelect,
  colapsado = false,
  onToggle,
  cabecera,
  pie,
  ancho = "w-64",
  ariaLabel = "Navegaci\xF3n principal",
  className
}) {
  return /* @__PURE__ */ jsxs14(
    "nav",
    {
      "aria-label": ariaLabel,
      className: cn("flex h-dvh flex-col border-r border-ink-600 bg-ink-900 transition-[width] duration-200", colapsado ? "w-[4.5rem]" : ancho, className),
      children: [
        /* @__PURE__ */ jsxs14("div", { className: cn("flex items-center gap-2 px-3 py-3", colapsado && "justify-center"), children: [
          cabecera && /* @__PURE__ */ jsx19("div", { className: "min-w-0 flex-1", children: cabecera }),
          onToggle && /* @__PURE__ */ jsx19(
            "button",
            {
              type: "button",
              onClick: onToggle,
              "aria-label": colapsado ? "Expandir men\xFA" : "Contraer men\xFA",
              "aria-expanded": !colapsado,
              className: cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mute transition hover:bg-ink-700 hover:text-fore", colapsado && "w-full"),
              children: /* @__PURE__ */ jsx19(Icon, { name: "back", className: cn("h-4 w-4 transition-transform", colapsado && "rotate-180") })
            }
          )
        ] }),
        /* @__PURE__ */ jsx19("ul", { className: "min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2", children: items.map((item) => {
          const activo = item.id === activeId;
          return /* @__PURE__ */ jsx19("li", { children: /* @__PURE__ */ jsxs14(
            "button",
            {
              type: "button",
              onClick: () => onSelect?.(item.id),
              "aria-current": activo ? "page" : void 0,
              title: colapsado ? item.label : void 0,
              className: cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                activo ? "bg-fono/15 text-fono-light" : "text-mute hover:bg-ink-700 hover:text-fore",
                colapsado && "justify-center px-2"
              ),
              children: [
                item.icono && /* @__PURE__ */ jsx19(Icon, { name: item.icono, className: "h-4 w-4 shrink-0" }),
                !colapsado && /* @__PURE__ */ jsx19("span", { className: "min-w-0 flex-1 truncate text-left", children: item.label }),
                !colapsado && item.contador != null && /* @__PURE__ */ jsx19("span", { className: "shrink-0 rounded-full bg-ink-700 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-mute", children: item.contador }),
                colapsado && item.contador != null && /* @__PURE__ */ jsx19("span", { className: "sr-only", children: item.contador })
              ]
            }
          ) }, item.id);
        }) }),
        pie && /* @__PURE__ */ jsx19("div", { className: "border-t border-ink-600 p-2", children: pie })
      ]
    }
  );
}

// src/components/MenuDesplegable.jsx
import { useEffect as useEffect2, useRef as useRef3, useState as useState5 } from "react";
import { jsx as jsx20, jsxs as jsxs15 } from "react/jsx-runtime";
function MenuDesplegable({ trigger, items = [], alineacion = "right", ariaLabel = "Men\xFA", className }) {
  const [abierto, setAbierto] = useState5(false);
  const raiz = useRef3(null);
  useEffect2(() => {
    if (!abierto) return void 0;
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return;
      setAbierto(false);
    };
    const cerrarEsc = (event) => {
      if (event.key === "Escape") setAbierto(false);
    };
    document.addEventListener("click", cerrarFuera);
    document.addEventListener("keydown", cerrarEsc);
    return () => {
      document.removeEventListener("click", cerrarFuera);
      document.removeEventListener("keydown", cerrarEsc);
    };
  }, [abierto]);
  return /* @__PURE__ */ jsxs15("div", { ref: raiz, className: cn("relative", className), children: [
    /* @__PURE__ */ jsx20(
      "button",
      {
        type: "button",
        "aria-haspopup": "menu",
        "aria-expanded": abierto,
        onClick: () => setAbierto((actual) => !actual),
        className: "inline-flex items-center gap-2 rounded-lg transition",
        children: trigger
      }
    ),
    abierto && /* @__PURE__ */ jsx20(
      "div",
      {
        role: "menu",
        "aria-label": ariaLabel,
        className: cn("absolute z-30 mt-1 min-w-48 rounded-xl border border-ink-500 bg-paper p-1 shadow-xl", alineacion === "right" ? "right-0" : "left-0"),
        children: items.map((item, indice) => {
          if (item.separador) return /* @__PURE__ */ jsx20("div", { className: "my-1 h-px bg-ink-600" }, `sep-${indice}`);
          return /* @__PURE__ */ jsxs15(
            "button",
            {
              type: "button",
              role: "menuitem",
              disabled: item.disabled,
              onClick: () => {
                setAbierto(false);
                item.onClick?.();
              },
              className: cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                item.peligro ? "text-bad hover:bg-bad/10" : "text-fore hover:bg-ink-700",
                item.disabled && "cursor-not-allowed opacity-40"
              ),
              children: [
                item.icono && /* @__PURE__ */ jsx20(Icon, { name: item.icono, className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsx20("span", { className: "min-w-0 flex-1 truncate", children: item.label }),
                item.extra
              ]
            },
            item.id ?? item.label ?? indice
          );
        })
      }
    )
  ] });
}

// src/components/PanelDerecho.jsx
import { jsx as jsx21, jsxs as jsxs16 } from "react/jsx-runtime";
function PanelDerecho({ children, panel, id, className, classNamePanel }) {
  return /* @__PURE__ */ jsxs16("div", { className: cn("grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]", className), children: [
    /* @__PURE__ */ jsx21("div", { className: "min-w-0 space-y-4", children }),
    /* @__PURE__ */ jsx21("aside", { id, className: cn("min-w-0 lg:sticky lg:top-24", classNamePanel), children: panel })
  ] });
}

// src/components/TarjetaAjuste.jsx
import { jsx as jsx22, jsxs as jsxs17 } from "react/jsx-runtime";
function TarjetaAjuste({ titulo: titulo2, descripcion, accion, icono, children, className, id }) {
  return /* @__PURE__ */ jsxs17(Card, { id, className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxs17("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs17("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs17("h2", { className: "flex items-center gap-2 font-semibold", children: [
          icono && /* @__PURE__ */ jsx22(Icon, { name: icono, className: "h-4 w-4 text-mute" }),
          titulo2
        ] }),
        descripcion && /* @__PURE__ */ jsx22("p", { className: "mt-1 text-sm text-mute", children: descripcion })
      ] }),
      accion && /* @__PURE__ */ jsx22("div", { className: "shrink-0", children: accion })
    ] }),
    children
  ] });
}

// src/components/AjustesImpresion.jsx
import { useState as useState6 } from "react";

// src/printing/estadoImpresoras.js
var ESTADO_IMPRESORA = Object.freeze({
  SIN_VERIFICAR: "sin-verificar",
  VERIFICANDO: "verificando",
  OK: "ok",
  ERROR: "error"
});
var ETIQUETA_ESTADO = Object.freeze({
  "sin-verificar": "Sin verificar",
  "verificando": "Verificando\u2026",
  "ok": "Lista para imprimir",
  "error": "Sin respuesta"
});
var TONO_ESTADO = Object.freeze({
  "sin-verificar": "slate",
  "verificando": "slate",
  "ok": "ok",
  "error": "bad"
});
var MOTIVO_TEXTO = Object.freeze({
  red_cambiada: "La impresora no est\xE1 en esta red",
  permisos_red_local: "El sistema bloque\xF3 la salida a la red local",
  permiso_o_red: "Puede faltar el permiso de Red Local",
  impresora_apagada: "La impresora rechaz\xF3 la conexi\xF3n"
});
var ETIQUETA_TRABAJO = Object.freeze({
  pendiente: "Pendiente",
  reclamado: "En el puente",
  aceptado: "Aceptado (falta confirmar)",
  incierto: "Incierto",
  fallido: "Fallido",
  confirmado: "Confirmado en papel",
  cancelado: "Cancelado",
  impreso: "Impreso"
});
var TONO_TRABAJO = Object.freeze({
  pendiente: "orange",
  reclamado: "blue",
  aceptado: "blue",
  incierto: "orange",
  fallido: "red",
  confirmado: "green",
  cancelado: "slate",
  impreso: "green"
});
var etiquetaTrabajo = (estado) => ETIQUETA_TRABAJO[String(estado || "").toLowerCase()] || String(estado || "\u2014");
var colorTrabajo = (estado) => TONO_TRABAJO[String(estado || "").toLowerCase()] || "slate";
function conexionDeDestino(destino) {
  return /^(usb|cups):/.test(String(destino || "")) ? "cups" : "lan";
}
function destinoDeConexion({ conexion = "lan", ip = "", puerto = "", cola = "" } = {}) {
  if (conexion === "cups" || conexion === "usb") {
    const nombre = String(cola || "").trim();
    return nombre ? `cups:${nombre}` : "";
  }
  const host = String(ip || "").trim();
  if (!host) return "";
  return `lan:${host}:${String(puerto || "").trim() || "9100"}`;
}
function estadoDeDiagnostico(resultado) {
  if (!resultado || typeof resultado !== "object" || resultado.ok === false) return ESTADO_IMPRESORA.ERROR;
  if (resultado.alcance === true) return ESTADO_IMPRESORA.OK;
  if (resultado.metodo === "CUPS") return resultado.cupsUri ? ESTADO_IMPRESORA.OK : ESTADO_IMPRESORA.ERROR;
  return ESTADO_IMPRESORA.ERROR;
}
function motivoDeDiagnostico(resultado) {
  if (!resultado || typeof resultado !== "object") return "El agente no respondi\xF3";
  if (resultado.metodo === "CUPS" && !resultado.cupsUri) return "La cola local no existe en esta computadora";
  return MOTIVO_TEXTO[resultado.motivo] || String(resultado.error || "Sin respuesta de la impresora");
}
function textoVerificacion(registro, ahora = Date.now()) {
  if (!registro || registro.estado === ESTADO_IMPRESORA.SIN_VERIFICAR) return "Sin verificar";
  if (registro.estado === ESTADO_IMPRESORA.VERIFICANDO) return "Verificando\u2026";
  const segundos = Number.isFinite(registro.fecha) ? Math.max(0, Math.round((ahora - registro.fecha) / 1e3)) : 0;
  if (registro.estado === ESTADO_IMPRESORA.OK) return `Verificada hace ${segundos} s`;
  return registro.motivo ? `Sin respuesta: ${registro.motivo}` : "Sin respuesta";
}
function agregarEstado(impresoras = [], estados = {}) {
  const activas = (impresoras || []).filter((impresora) => impresora?.activa !== false);
  const total = activas.length;
  let ok = 0;
  let error = 0;
  for (const impresora of activas) {
    const estado = estados?.[impresora?.id]?.estado;
    if (estado === ESTADO_IMPRESORA.OK) ok += 1;
    else if (estado === ESTADO_IMPRESORA.ERROR) error += 1;
  }
  const sinVerificar = total - ok - error;
  if (!total) return { estado: "sin-verificar", label: "Sin verificar", tono: "slate", total, ok, error, sinVerificar, detalle: "Sin impresoras activas" };
  if (error > 0) return { estado: "con-problemas", label: "Con problemas", tono: "bad", total, ok, error, sinVerificar, detalle: `${error} de ${total} sin respuesta` };
  if (ok === total) return { estado: "listo", label: "Listo para imprimir", tono: "ok", total, ok, error, sinVerificar, detalle: `${total} de ${total} listas` };
  return { estado: "sin-verificar", label: "Sin verificar", tono: "slate", total, ok, error, sinVerificar, detalle: `${sinVerificar} de ${total} sin verificar` };
}

// src/components/AjustesImpresion.jsx
import { jsx as jsx23, jsxs as jsxs18 } from "react/jsx-runtime";
var VACIO = () => ({
  id: null,
  nombre: "",
  ubicacion: "",
  conexion: "lan",
  ip: "",
  puerto: "9100",
  cola: "",
  ancho: "80",
  copias: "1",
  predeterminada: false,
  activa: true
});
var ANCHOS = [
  { id: "80", label: "80 mm (t\xE9rmica)" },
  { id: "58", label: "58 mm (t\xE9rmica chica)" },
  { id: "a4", label: "A4 (l\xE1ser/inyecci\xF3n)" }
];
function aFormulario(impresora) {
  if (!impresora) return VACIO();
  const conexion = impresora.conexion === "cups" || conexionDeDestino(impresora.destino) === "cups" ? "cups" : "lan";
  const destino = String(impresora.destino || "");
  const [, ip = "", puerto = "9100"] = destino.match(/^lan:([^:]+):?(\d+)?/) || [];
  return {
    ...VACIO(),
    ...impresora,
    conexion,
    ip: impresora.ip || ip,
    puerto: impresora.puerto || puerto || "9100",
    cola: impresora.cola || (destino.startsWith("cups:") ? destino.slice(5) : ""),
    copias: String(impresora.copias ?? "1")
  };
}
function AjustesImpresion({
  impresoras = [],
  estado = {},
  guardando = false,
  probando = null,
  onGuardar,
  onEliminar,
  onProbar,
  onVerificar,
  anchoOpciones = ANCHOS,
  titulo: titulo2 = "Impresoras",
  descripcion = "Eleg\xED c\xF3mo sale el papel: por red (LAN) o por una cola local (USB). La app verifica cada impresora antes de usarla.",
  className
}) {
  const [form, setForm] = useState6(null);
  const resumen = agregarEstado(impresoras, estado);
  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }
  function enviar(event) {
    event.preventDefault();
    if (!form) return;
    const destino = destinoDeConexion(form);
    if (!destino) return;
    onGuardar?.({ ...form, destino, copias: Number(form.copias) || 1 });
    setForm(null);
  }
  return /* @__PURE__ */ jsxs18(Card, { className: cn("space-y-4", className), children: [
    /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs18("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs18("h2", { className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsx23(Icon, { name: "printer", className: "h-4 w-4" }),
          titulo2
        ] }),
        /* @__PURE__ */ jsx23("p", { className: "mt-1 text-sm text-mute", children: descripcion })
      ] }),
      /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx23(Badge, { color: resumen.tono, className: "w-fit whitespace-nowrap", title: resumen.detalle, children: resumen.label }),
        onVerificar && /* @__PURE__ */ jsxs18(Button, { type: "button", variant: "outline", onClick: onVerificar, children: [
          /* @__PURE__ */ jsx23(Icon, { name: "refresh", className: "h-3.5 w-3.5" }),
          "Verificar"
        ] }),
        /* @__PURE__ */ jsxs18(Button, { type: "button", onClick: () => setForm(VACIO()), children: [
          /* @__PURE__ */ jsx23(Icon, { name: "plus", className: "h-4 w-4" }),
          "Agregar impresora"
        ] })
      ] })
    ] }),
    impresoras.length === 0 && /* @__PURE__ */ jsx23("p", { className: "rounded-xl border border-ink-600 p-4 text-sm text-mute", children: "Todav\xEDa no hay impresoras configuradas." }),
    /* @__PURE__ */ jsx23("ul", { className: "space-y-2", children: impresoras.map((impresora) => {
      const registro = estado?.[impresora.id];
      const tono = TONO_ESTADO[registro?.estado] || "slate";
      return /* @__PURE__ */ jsxs18("li", { className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-600 p-3", children: [
        /* @__PURE__ */ jsxs18("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs18("p", { className: "flex items-center gap-2 font-medium", children: [
            /* @__PURE__ */ jsx23(Dot, { color: tono }),
            impresora.nombre || "Impresora",
            impresora.predeterminada && /* @__PURE__ */ jsx23(Badge, { color: "fono", children: "Predeterminada" }),
            impresora.activa === false && /* @__PURE__ */ jsx23(Badge, { color: "slate", children: "Inactiva" })
          ] }),
          /* @__PURE__ */ jsxs18("p", { className: "mt-0.5 truncate text-xs text-mute", title: impresora.destino, children: [
            conexionDeDestino(impresora.destino) === "cups" ? "USB / cola local" : "LAN",
            " \xB7 ",
            impresora.destino || "sin destino",
            " \xB7 ",
            impresora.ancho || "80",
            " mm",
            registro ? ` \xB7 ${textoVerificacion(registro)}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center gap-1", children: [
          onProbar && /* @__PURE__ */ jsx23(Button, { type: "button", variant: "outline", disabled: probando === impresora.id, onClick: () => onProbar(impresora), children: probando === impresora.id ? "Probando\u2026" : "Imprimir prueba" }),
          /* @__PURE__ */ jsx23(Button, { type: "button", variant: "ghost", onClick: () => setForm(aFormulario(impresora)), children: "Editar" }),
          onEliminar && /* @__PURE__ */ jsx23(Button, { type: "button", variant: "ghost", className: "text-bad", onClick: () => onEliminar(impresora.id), children: "Eliminar" })
        ] })
      ] }, impresora.id);
    }) }),
    form && /* @__PURE__ */ jsxs18("form", { onSubmit: enviar, className: "space-y-3 rounded-xl border border-fono/25 bg-fono/5 p-3", children: [
      /* @__PURE__ */ jsxs18("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs18("div", { children: [
          /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-nombre", children: "Nombre" }),
          /* @__PURE__ */ jsx23(Input, { id: "imp-nombre", required: true, value: form.nombre, onChange: (event) => cambiar("nombre", event.target.value), placeholder: "Mostrador" })
        ] }),
        /* @__PURE__ */ jsxs18("div", { children: [
          /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-ubicacion", children: "Ubicaci\xF3n (opcional)" }),
          /* @__PURE__ */ jsx23(Input, { id: "imp-ubicacion", value: form.ubicacion, onChange: (event) => cambiar("ubicacion", event.target.value), placeholder: "Caja 1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs18("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs18("div", { children: [
          /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-conexion", children: "Conexi\xF3n" }),
          /* @__PURE__ */ jsxs18(Select, { id: "imp-conexion", value: form.conexion, onChange: (event) => cambiar("conexion", event.target.value), children: [
            /* @__PURE__ */ jsx23("option", { value: "lan", children: "LAN (impresora de red)" }),
            /* @__PURE__ */ jsx23("option", { value: "cups", children: "USB / cola local (CUPS)" })
          ] })
        ] }),
        form.conexion === "lan" ? /* @__PURE__ */ jsxs18("div", { className: "grid grid-cols-[minmax(0,1fr)_6rem] gap-2", children: [
          /* @__PURE__ */ jsxs18("div", { children: [
            /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-ip", children: "IP" }),
            /* @__PURE__ */ jsx23(Input, { id: "imp-ip", required: true, value: form.ip, onChange: (event) => cambiar("ip", event.target.value), placeholder: "192.168.1.50", inputMode: "decimal" })
          ] }),
          /* @__PURE__ */ jsxs18("div", { children: [
            /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-puerto", children: "Puerto" }),
            /* @__PURE__ */ jsx23(Input, { id: "imp-puerto", value: form.puerto, onChange: (event) => cambiar("puerto", event.target.value.replace(/\D/g, "")), placeholder: "9100", inputMode: "numeric" })
          ] })
        ] }) : /* @__PURE__ */ jsxs18("div", { children: [
          /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-cola", children: "Cola local" }),
          /* @__PURE__ */ jsx23(Input, { id: "imp-cola", required: true, value: form.cola, onChange: (event) => cambiar("cola", event.target.value), placeholder: "Nombre exacto en el sistema" }),
          /* @__PURE__ */ jsx23("p", { className: "mt-1 text-xs text-mute", children: "En Windows/macOS el nombre de la cola es el que ves en Impresoras del sistema." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs18("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxs18("div", { children: [
          /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-ancho", children: "Ancho de papel" }),
          /* @__PURE__ */ jsx23(Select, { id: "imp-ancho", value: form.ancho, onChange: (event) => cambiar("ancho", event.target.value), children: anchoOpciones.map((opcion) => /* @__PURE__ */ jsx23("option", { value: opcion.id, children: opcion.label }, opcion.id)) })
        ] }),
        /* @__PURE__ */ jsxs18("div", { children: [
          /* @__PURE__ */ jsx23(Label, { htmlFor: "imp-copias", children: "Copias" }),
          /* @__PURE__ */ jsx23(Input, { id: "imp-copias", value: form.copias, onChange: (event) => cambiar("copias", event.target.value.replace(/\D/g, "")), inputMode: "numeric", maxLength: 2 })
        ] }),
        /* @__PURE__ */ jsxs18("label", { className: "flex items-end gap-2 pb-2 text-sm", children: [
          /* @__PURE__ */ jsx23("input", { type: "checkbox", className: "h-4 w-4 accent-fono", checked: form.predeterminada, onChange: (event) => cambiar("predeterminada", event.target.checked) }),
          "Predeterminada"
        ] })
      ] }),
      /* @__PURE__ */ jsx23("p", { className: "text-xs text-mute", children: form.conexion === "lan" ? `Se guardar\xE1 como lan:${form.ip || "<ip>"}:${form.puerto || "9100"}` : `Se guardar\xE1 como cups:${form.cola || "<cola>"}` }),
      /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap justify-end gap-2", children: [
        /* @__PURE__ */ jsx23(Button, { type: "button", variant: "ghost", onClick: () => setForm(null), children: "Cancelar" }),
        /* @__PURE__ */ jsx23(Button, { type: "submit", disabled: guardando, children: guardando ? "Guardando\u2026" : "Guardar impresora" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs18("p", { className: "text-xs text-mute", children: [
      "La impresi\xF3n sale por el ",
      /* @__PURE__ */ jsx23("b", { className: "text-fore", children: "agente local" }),
      ": instalalo en la computadora que tiene la impresora (LAN o USB conectada) y vinculala con el c\xF3digo. Con el agente ca\xEDdo, los trabajos quedan en cola; nunca se pierden. Ver ",
      /* @__PURE__ */ jsx23("b", { className: "text-fore", children: "docs/IMPRESION.md" }),
      "."
    ] })
  ] });
}

// src/components/BotonImprimir.jsx
import { jsx as jsx24, jsxs as jsxs19 } from "react/jsx-runtime";
function BotonImprimir({
  onImprimir,
  estado = null,
  etiqueta = "Imprimir",
  icono = "printer",
  variant = "outline",
  disabled = false,
  className
}) {
  const enCurso = estado === "pendiente" || estado === "reclamado";
  const texto = enCurso ? etiquetaTrabajo(estado) : etiqueta;
  return /* @__PURE__ */ jsxs19("span", { className: cn("inline-flex items-center gap-2", className), children: [
    /* @__PURE__ */ jsxs19(Button, { type: "button", variant, disabled: disabled || enCurso, onClick: onImprimir, "aria-busy": enCurso, children: [
      /* @__PURE__ */ jsx24(Icon, { name: icono, className: "h-4 w-4" }),
      texto
    ] }),
    estado && !enCurso && /* @__PURE__ */ jsx24(Badge, { color: colorTrabajo(estado), className: "whitespace-nowrap", children: etiquetaTrabajo(estado) })
  ] });
}

// src/components/BancoCombobox.jsx
import { useEffect as useEffect3, useId as useId2, useMemo as useMemo2, useRef as useRef4, useState as useState8 } from "react";

// src/utils/bancos.js
var BANCOS_PARAGUAY = [
  "Banco Atlas",
  "Banco Basa",
  "Banco Continental",
  "Banco de la Naci\xF3n Argentina",
  "Banco do Brasil",
  "Banco Familiar",
  "Banco GNB Paraguay",
  "Banco Interfisa",
  "Banco Ita\xFA Paraguay",
  "Banco Nacional de Fomento",
  "Banco Sudameris",
  "Bancop",
  "Citibank Paraguay",
  "Coomecipar",
  "Cooperativa Medalla Milagrosa",
  "Cooperativa San Crist\xF3bal",
  "Cooperativa Universitaria",
  "Financiera El Comercio",
  "Financiera Finexpar",
  "Financiera Paraguayo Japonesa",
  "Solar Banco",
  "ueno bank"
];
var LOGOS_BANCOS = {
  "Banco Atlas": { archivo: "banco-atlas.png" },
  "Banco Basa": { archivo: "banco-basa.svg" },
  "Banco Continental": { marca: "continental" },
  "Banco de la Naci\xF3n Argentina": { archivo: "banco-nacion-argentina.png", chip: true, alias: ["banco nacion", "bna"] },
  "Banco do Brasil": { archivo: "banco-do-brasil.svg", alias: ["bb", "brasil"] },
  "Banco Familiar": { marca: "familiar" },
  "Banco GNB Paraguay": { archivo: "banco-gnb.svg" },
  "Banco Interfisa": { archivo: "interfisa.png" },
  "Banco Ita\xFA Paraguay": { archivo: "itau.png", alias: ["itau", "banco itau", "itau paraguay"] },
  "Banco Nacional de Fomento": { archivo: "bnf.png" },
  "Banco Sudameris": { archivo: "sudameris.png" },
  "Bancop": { archivo: "bancop.png" },
  "Citibank Paraguay": { archivo: "citibank.svg", alias: ["citibank", "citi"] },
  "Coomecipar": { monograma: "CO", color: "#0B6E4F" },
  "Cooperativa Medalla Milagrosa": { monograma: "MMM", color: "#6C3FA0" },
  "Cooperativa San Crist\xF3bal": { monograma: "CSC", color: "#167A54" },
  "Cooperativa Universitaria": { monograma: "CU", color: "#1D4E9E" },
  "Financiera El Comercio": { monograma: "FEC", color: "#0E7C7B" },
  "Financiera Finexpar": { monograma: "FX", color: "#C24E1B" },
  "Financiera Paraguayo Japonesa": { archivo: "paraguayo-japonesa.png" },
  "Solar Banco": { archivo: "solar.svg", alias: ["solar", "solar ahorro y finanzas"] },
  "ueno bank": { marca: "ueno", alias: ["ueno"] }
};
var COLORES_BANCO_RESPALDO = ["#33414F", "#1D4E9E", "#0B6E4F", "#8A3A1B", "#6C3FA0", "#12659E"];
function normalizarBanco(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
var INDICE = new Map(
  Object.entries(LOGOS_BANCOS).flatMap(
    ([nombre, entrada]) => [nombre, ...entrada.alias || []].map((clave) => [normalizarBanco(clave), { nombre, ...entrada }])
  )
);
var VACIAS = /* @__PURE__ */ new Set(["banco", "financiera", "cooperativa", "banca", "de", "del", "la", "el", "y"]);
function inicialesDeBanco(nombre) {
  const palabras = String(nombre || "").split(/[\s/]+/).filter(Boolean);
  const utiles = palabras.filter((palabra) => !VACIAS.has(normalizarBanco(palabra)));
  const base = (utiles.length ? utiles : palabras).slice(0, 3);
  const iniciales = base.map((palabra) => palabra[0].toUpperCase()).join("");
  return iniciales || "?";
}
function colorDeBanco(nombre) {
  const texto = normalizarBanco(nombre);
  let hash = 0;
  for (const letra of texto) hash = (hash * 31 + letra.charCodeAt(0)) % 9973;
  return COLORES_BANCO_RESPALDO[hash % COLORES_BANCO_RESPALDO.length];
}
function logoDeBanco(nombre) {
  const texto = String(nombre || "").trim();
  if (!texto) return null;
  const entrada = INDICE.get(normalizarBanco(texto));
  if (entrada?.archivo) return { banco: entrada.nombre, tipo: "archivo", archivo: entrada.archivo, chip: Boolean(entrada.chip) };
  if (entrada?.marca) return { banco: entrada.nombre, tipo: "marca", marca: entrada.marca };
  if (entrada) return { banco: entrada.nombre, tipo: "monograma", iniciales: entrada.monograma, color: entrada.color };
  return { banco: texto, tipo: "monograma", iniciales: inicialesDeBanco(texto), color: colorDeBanco(texto), generico: true };
}
function sugerenciasDeBanco(texto, catalogo = BANCOS_PARAGUAY) {
  const termino = normalizarBanco(texto);
  if (!termino) return catalogo;
  return catalogo.filter((banco) => normalizarBanco(banco).includes(termino));
}

// src/components/BancoLogo.jsx
import { useState as useState7 } from "react";
import { jsx as jsx25 } from "react/jsx-runtime";
function BancoLogo({ banco, alto = "h-5", className, soloCatalogo = false, baseAssets = "/bancos", marcas = {} }) {
  const [fallo, setFallo] = useState7(false);
  const texto = String(banco || "").trim();
  const registro = logoDeBanco(texto);
  if (!registro) return null;
  const marca = registro.tipo === "marca" ? registro.marca : null;
  if (marca && marcas[marca]) {
    const Logo = marcas[marca];
    return /* @__PURE__ */ jsx25("span", { className: cn("inline-flex items-center", alto, className), title: texto, children: /* @__PURE__ */ jsx25(Logo, {}) });
  }
  if (soloCatalogo && registro.generico) return null;
  if (registro.tipo === "archivo" && !fallo) {
    return /* @__PURE__ */ jsx25("span", { className: cn("inline-flex items-center", alto, className), title: texto, children: /* @__PURE__ */ jsx25(
      "img",
      {
        src: baseAssets ? `${baseAssets.replace(/\/$/, "")}/${registro.archivo}` : registro.archivo,
        alt: "",
        loading: "lazy",
        onError: () => setFallo(true),
        className: cn("h-full w-auto max-w-[6rem] object-contain", registro.chip && "rounded-[4px] bg-white px-1 py-[1px]")
      }
    ) });
  }
  const iniciales = registro.iniciales || inicialesDeBanco(texto);
  const color = registro.color || colorDeBanco(texto);
  return /* @__PURE__ */ jsx25("span", { className: cn("inline-flex items-center", alto, className), title: texto, children: /* @__PURE__ */ jsx25(
    "span",
    {
      "aria-hidden": "true",
      className: "grid h-full min-w-[1.15rem] place-items-center rounded-[5px] px-1 text-[9px] font-bold leading-none tracking-tight text-white",
      style: { backgroundColor: color },
      children: iniciales
    }
  ) });
}

// src/components/BancoCombobox.jsx
import { jsx as jsx26, jsxs as jsxs20 } from "react/jsx-runtime";
function BancoCombobox({
  id,
  value = "",
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className,
  catalogo = BANCOS_PARAGUAY,
  logoProps
}) {
  const [abierto, setAbierto] = useState8(false);
  const [resaltado, setResaltado] = useState8(0);
  const listaId = useId2();
  const raiz = useRef4(null);
  const lista = useRef4(null);
  useEffect3(() => {
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return;
      setAbierto(false);
    };
    document.addEventListener("click", cerrarFuera);
    return () => document.removeEventListener("click", cerrarFuera);
  }, []);
  const sugerencias = useMemo2(() => sugerenciasDeBanco(value, catalogo), [value, catalogo]);
  useEffect3(() => {
    if (!abierto) return;
    lista.current?.querySelector(`#${CSS.escape(`${listaId}-${resaltado}`)}`)?.scrollIntoView({ block: "nearest" });
  }, [abierto, resaltado, listaId]);
  function elegir(banco) {
    onChange?.(banco);
    setAbierto(false);
    setResaltado(0);
  }
  function alTeclear(event) {
    if (event.key === "Escape") {
      setAbierto(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!abierto) {
        setAbierto(true);
        return;
      }
      if (!sugerencias.length) return;
      const paso = event.key === "ArrowDown" ? 1 : -1;
      setResaltado((actual) => (actual + paso + sugerencias.length) % sugerencias.length);
      return;
    }
    if (event.key === "Enter" && abierto && sugerencias[resaltado]) {
      event.preventDefault();
      elegir(sugerencias[resaltado]);
    }
  }
  const listaVisible = abierto && sugerencias.length > 0;
  return /* @__PURE__ */ jsxs20("div", { ref: raiz, className: cn("relative", className), children: [
    /* @__PURE__ */ jsx26(
      Input,
      {
        id,
        role: "combobox",
        "aria-expanded": listaVisible,
        "aria-controls": listaId,
        "aria-autocomplete": "list",
        "aria-activedescendant": listaVisible ? `${listaId}-${resaltado}` : void 0,
        autoComplete: "off",
        required,
        disabled,
        value,
        placeholder,
        onChange: (event) => {
          onChange?.(event.target.value);
          setAbierto(true);
          setResaltado(0);
        },
        onFocus: () => setAbierto(true),
        onKeyDown: alTeclear
      }
    ),
    listaVisible && /* @__PURE__ */ jsx26(
      "ul",
      {
        id: listaId,
        ref: lista,
        role: "listbox",
        "aria-label": "Bancos",
        className: "absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-ink-500 bg-paper p-1 shadow-xl",
        children: sugerencias.map((banco, indice) => /* @__PURE__ */ jsx26("li", { id: `${listaId}-${indice}`, role: "option", "aria-selected": indice === resaltado, children: /* @__PURE__ */ jsxs20(
          "button",
          {
            type: "button",
            className: cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition", indice === resaltado ? "bg-ink-700 text-fore" : "text-mute hover:bg-ink-700 hover:text-fore"),
            onMouseEnter: () => setResaltado(indice),
            onMouseDown: (event) => event.preventDefault(),
            onClick: () => elegir(banco),
            children: [
              /* @__PURE__ */ jsx26(BancoLogo, { banco, alto: "h-4", ...logoProps }),
              /* @__PURE__ */ jsx26("span", { className: "min-w-0 flex-1 truncate", children: banco })
            ]
          }
        ) }, banco))
      }
    )
  ] });
}

// src/components/CityAutocomplete.jsx
import { useEffect as useEffect4, useRef as useRef5, useState as useState9 } from "react";

// src/catalog/ciudades.js
var CIUDADES_PARAGUAY = [
  { ciudad: "Bah\xEDa Negra", departamento: "Alto Paraguay" },
  { ciudad: "Capit\xE1n Carmelo Peralta", departamento: "Alto Paraguay" },
  { ciudad: "Fuerte Olimpo", departamento: "Alto Paraguay" },
  { ciudad: "Puerto Casado", departamento: "Alto Paraguay" },
  { ciudad: "Ciudad del Este", departamento: "Alto Paran\xE1" },
  { ciudad: "Doctor Juan Le\xF3n Mallorqu\xEDn", departamento: "Alto Paran\xE1" },
  { ciudad: "Doctor Ra\xFAl Pe\xF1a", departamento: "Alto Paran\xE1" },
  { ciudad: "Domingo Mart\xEDnez de Irala", departamento: "Alto Paran\xE1" },
  { ciudad: "Hernandarias", departamento: "Alto Paran\xE1" },
  { ciudad: "Iru\xF1a", departamento: "Alto Paran\xE1" },
  { ciudad: "Itakyry", departamento: "Alto Paran\xE1" },
  { ciudad: "Juan Emiliano O''Leary", departamento: "Alto Paran\xE1" },
  { ciudad: "Los Cedrales", departamento: "Alto Paran\xE1" },
  { ciudad: "Mbaracay\xFA", departamento: "Alto Paran\xE1" },
  { ciudad: "Minga Guaz\xFA", departamento: "Alto Paran\xE1" },
  { ciudad: "Minga Por\xE1", departamento: "Alto Paran\xE1" },
  { ciudad: "Naranjal", departamento: "Alto Paran\xE1" },
  { ciudad: "\xD1acunday", departamento: "Alto Paran\xE1" },
  { ciudad: "Presidente Franco", departamento: "Alto Paran\xE1" },
  { ciudad: "San Alberto", departamento: "Alto Paran\xE1" },
  { ciudad: "San Crist\xF3bal", departamento: "Alto Paran\xE1" },
  { ciudad: "Santa Fe del Paran\xE1", departamento: "Alto Paran\xE1" },
  { ciudad: "Santa Rita", departamento: "Alto Paran\xE1" },
  { ciudad: "Santa Rosa del Monday", departamento: "Alto Paran\xE1" },
  { ciudad: "Tavapy", departamento: "Alto Paran\xE1" },
  { ciudad: "Yguaz\xFA", departamento: "Alto Paran\xE1" },
  { ciudad: "Bella Vista Norte", departamento: "Amambay" },
  { ciudad: "Capit\xE1n Bado", departamento: "Amambay" },
  { ciudad: "Cerro Cor\xE1", departamento: "Amambay" },
  { ciudad: "Karapa\xED", departamento: "Amambay" },
  { ciudad: "Pedro Juan Caballero", departamento: "Amambay" },
  { ciudad: "Zanja Pyt\xE1", departamento: "Amambay" },
  { ciudad: "Asunci\xF3n", departamento: "Asunci\xF3n" },
  { ciudad: "Boquer\xF3n", departamento: "Boquer\xF3n" },
  { ciudad: "Filadelfia", departamento: "Boquer\xF3n" },
  { ciudad: "Loma Plata", departamento: "Boquer\xF3n" },
  { ciudad: "Mariscal Jos\xE9 F\xE9lix Estigarribia", departamento: "Boquer\xF3n" },
  { ciudad: "Caaguaz\xFA", departamento: "Caaguaz\xFA" },
  { ciudad: "Caraya\xF3", departamento: "Caaguaz\xFA" },
  { ciudad: "Coronel Oviedo", departamento: "Caaguaz\xFA" },
  { ciudad: "Doctor Cecilio B\xE1ez", departamento: "Caaguaz\xFA" },
  { ciudad: "Doctor Juan Eulogio Estigarribia", departamento: "Caaguaz\xFA" },
  { ciudad: "Doctor Juan Manuel Frutos", departamento: "Caaguaz\xFA" },
  { ciudad: "Jos\xE9 Domingo Ocampos", departamento: "Caaguaz\xFA" },
  { ciudad: "La Pastora", departamento: "Caaguaz\xFA" },
  { ciudad: "Mariscal Francisco Solano L\xF3pez", departamento: "Caaguaz\xFA" },
  { ciudad: "Nueva Londres", departamento: "Caaguaz\xFA" },
  { ciudad: "Nueva Toledo", departamento: "Caaguaz\xFA" },
  { ciudad: "Ra\xFAl Arsenio Oviedo", departamento: "Caaguaz\xFA" },
  { ciudad: "Regimiento de Infanter\xEDa Tres Corrales", departamento: "Caaguaz\xFA" },
  { ciudad: "Repatriaci\xF3n", departamento: "Caaguaz\xFA" },
  { ciudad: "San Joaqu\xEDn", departamento: "Caaguaz\xFA" },
  { ciudad: "San Jos\xE9 de los Arroyos", departamento: "Caaguaz\xFA" },
  { ciudad: "Santa Rosa del Mbutuy", departamento: "Caaguaz\xFA" },
  { ciudad: "Sim\xF3n Bol\xEDvar", departamento: "Caaguaz\xFA" },
  { ciudad: "Tembiapor\xE1", departamento: "Caaguaz\xFA" },
  { ciudad: "Tres de Febrero", departamento: "Caaguaz\xFA" },
  { ciudad: "Vaquer\xEDa", departamento: "Caaguaz\xFA" },
  { ciudad: "Yh\xFA", departamento: "Caaguaz\xFA" },
  { ciudad: "Aba\xED", departamento: "Caazap\xE1" },
  { ciudad: "Buena Vista", departamento: "Caazap\xE1" },
  { ciudad: "Caazap\xE1", departamento: "Caazap\xE1" },
  { ciudad: "Doctor Mois\xE9s Santiago Bertoni", departamento: "Caazap\xE1" },
  { ciudad: "Fulgencio Yegros", departamento: "Caazap\xE1" },
  { ciudad: "General Higinio Mor\xEDnigo", departamento: "Caazap\xE1" },
  { ciudad: "Maciel", departamento: "Caazap\xE1" },
  { ciudad: "San Juan Nepomuceno", departamento: "Caazap\xE1" },
  { ciudad: "Tava\xED", departamento: "Caazap\xE1" },
  { ciudad: "Tres de Mayo", departamento: "Caazap\xE1" },
  { ciudad: "Yuty", departamento: "Caazap\xE1" },
  { ciudad: "Corpus Christi", departamento: "Canindey\xFA" },
  { ciudad: "Curuguaty", departamento: "Canindey\xFA" },
  { ciudad: "General Francisco Caballero \xC1lvarez", departamento: "Canindey\xFA" },
  { ciudad: "Itanar\xE1", departamento: "Canindey\xFA" },
  { ciudad: "Katuet\xE9", departamento: "Canindey\xFA" },
  { ciudad: "La Paloma del Esp\xEDritu Santo", departamento: "Canindey\xFA" },
  { ciudad: "Laurel", departamento: "Canindey\xFA" },
  { ciudad: "Maracan\xE1", departamento: "Canindey\xFA" },
  { ciudad: "Nueva Esperanza", departamento: "Canindey\xFA" },
  { ciudad: "Puerto Adela", departamento: "Canindey\xFA" },
  { ciudad: "Saltos del Guair\xE1", departamento: "Canindey\xFA" },
  { ciudad: "Villa Ygatim\xED", departamento: "Canindey\xFA" },
  { ciudad: "Yasy Ca\xF1y", departamento: "Canindey\xFA" },
  { ciudad: "Yby Pyt\xE1", departamento: "Canindey\xFA" },
  { ciudad: "Ybyraroban\xE1", departamento: "Canindey\xFA" },
  { ciudad: "Ypejh\xFA", departamento: "Canindey\xFA" },
  { ciudad: "Aregu\xE1", departamento: "Central" },
  { ciudad: "Capiat\xE1", departamento: "Central" },
  { ciudad: "Fernando de la Mora", departamento: "Central" },
  { ciudad: "Guarambar\xE9", departamento: "Central" },
  { ciudad: "It\xE1", departamento: "Central" },
  { ciudad: "Itaugu\xE1", departamento: "Central" },
  { ciudad: "Juli\xE1n Augusto Sald\xEDvar", departamento: "Central" },
  { ciudad: "Lambar\xE9", departamento: "Central" },
  { ciudad: "Limpio", departamento: "Central" },
  { ciudad: "Luque", departamento: "Central" },
  { ciudad: "Mariano Roque Alonso", departamento: "Central" },
  { ciudad: "Nueva Italia", departamento: "Central" },
  { ciudad: "\xD1emby", departamento: "Central" },
  { ciudad: "San Antonio", departamento: "Central" },
  { ciudad: "San Lorenzo", departamento: "Central" },
  { ciudad: "Villa Elisa", departamento: "Central" },
  { ciudad: "Villeta", departamento: "Central" },
  { ciudad: "Ypacara\xED", departamento: "Central" },
  { ciudad: "Ypan\xE9", departamento: "Central" },
  { ciudad: "Arroyito", departamento: "Concepci\xF3n" },
  { ciudad: "Azotey", departamento: "Concepci\xF3n" },
  { ciudad: "Bel\xE9n", departamento: "Concepci\xF3n" },
  { ciudad: "Concepci\xF3n", departamento: "Concepci\xF3n" },
  { ciudad: "Horqueta", departamento: "Concepci\xF3n" },
  { ciudad: "Itacu\xE1", departamento: "Concepci\xF3n" },
  { ciudad: "Loreto", departamento: "Concepci\xF3n" },
  { ciudad: "Paso Barreto", departamento: "Concepci\xF3n" },
  { ciudad: "Paso Horqueta", departamento: "Concepci\xF3n" },
  { ciudad: "San Alfredo", departamento: "Concepci\xF3n" },
  { ciudad: "San Carlos del Apa", departamento: "Concepci\xF3n" },
  { ciudad: "San L\xE1zaro", departamento: "Concepci\xF3n" },
  { ciudad: "Sargento Jos\xE9 F\xE9lix L\xF3pez", departamento: "Concepci\xF3n" },
  { ciudad: "Yby Ya\xFA", departamento: "Concepci\xF3n" },
  { ciudad: "Altos", departamento: "Cordillera" },
  { ciudad: "Arroyos y Esteros", departamento: "Cordillera" },
  { ciudad: "Atyr\xE1", departamento: "Cordillera" },
  { ciudad: "Caacup\xE9", departamento: "Cordillera" },
  { ciudad: "Caraguatay", departamento: "Cordillera" },
  { ciudad: "Emboscada", departamento: "Cordillera" },
  { ciudad: "Eusebio Ayala", departamento: "Cordillera" },
  { ciudad: "Isla Puc\xFA", departamento: "Cordillera" },
  { ciudad: "Itacurub\xED de la Cordillera", departamento: "Cordillera" },
  { ciudad: "Juan de Mena", departamento: "Cordillera" },
  { ciudad: "Loma Grande", departamento: "Cordillera" },
  { ciudad: "Mbocayaty del Yhaguy", departamento: "Cordillera" },
  { ciudad: "Nueva Colombia", departamento: "Cordillera" },
  { ciudad: "Piribebuy", departamento: "Cordillera" },
  { ciudad: "Primero de Marzo", departamento: "Cordillera" },
  { ciudad: "San Bernardino", departamento: "Cordillera" },
  { ciudad: "San Jos\xE9 Obrero", departamento: "Cordillera" },
  { ciudad: "Santa Elena", departamento: "Cordillera" },
  { ciudad: "Tobat\xED", departamento: "Cordillera" },
  { ciudad: "Valenzuela", departamento: "Cordillera" },
  { ciudad: "Borja", departamento: "Guair\xE1" },
  { ciudad: "Capit\xE1n Mauricio Jos\xE9 Troche", departamento: "Guair\xE1" },
  { ciudad: "Coronel Mart\xEDnez", departamento: "Guair\xE1" },
  { ciudad: "Doctor Botrell", departamento: "Guair\xE1" },
  { ciudad: "F\xE9lix P\xE9rez Cardozo", departamento: "Guair\xE1" },
  { ciudad: "General Eugenio Alejandrino Garay", departamento: "Guair\xE1" },
  { ciudad: "Independencia", departamento: "Guair\xE1" },
  { ciudad: "Itap\xE9", departamento: "Guair\xE1" },
  { ciudad: "Iturbe", departamento: "Guair\xE1" },
  { ciudad: "Jos\xE9 A. Fassardi", departamento: "Guair\xE1" },
  { ciudad: "Mbocayaty del Guair\xE1", departamento: "Guair\xE1" },
  { ciudad: "Natalicio Talavera", departamento: "Guair\xE1" },
  { ciudad: "\xD1um\xED", departamento: "Guair\xE1" },
  { ciudad: "Paso Yob\xE1i", departamento: "Guair\xE1" },
  { ciudad: "San Salvador", departamento: "Guair\xE1" },
  { ciudad: "Tebicuary", departamento: "Guair\xE1" },
  { ciudad: "Villarrica", departamento: "Guair\xE1" },
  { ciudad: "Yataity del Guair\xE1", departamento: "Guair\xE1" },
  { ciudad: "Alto Ver\xE1", departamento: "Itap\xFAa" },
  { ciudad: "Bella Vista", departamento: "Itap\xFAa" },
  { ciudad: "Cambyret\xE1", departamento: "Itap\xFAa" },
  { ciudad: "Capit\xE1n Meza", departamento: "Itap\xFAa" },
  { ciudad: "Capit\xE1n Miranda", departamento: "Itap\xFAa" },
  { ciudad: "Carlos Antonio L\xF3pez", departamento: "Itap\xFAa" },
  { ciudad: "Carmen del Paran\xE1", departamento: "Itap\xFAa" },
  { ciudad: "Coronel Jos\xE9 F\xE9lix Bogado", departamento: "Itap\xFAa" },
  { ciudad: "Edelira", departamento: "Itap\xFAa" },
  { ciudad: "Encarnaci\xF3n", departamento: "Itap\xFAa" },
  { ciudad: "Fram", departamento: "Itap\xFAa" },
  { ciudad: "General Artigas", departamento: "Itap\xFAa" },
  { ciudad: "General Delgado", departamento: "Itap\xFAa" },
  { ciudad: "Hohenau", departamento: "Itap\xFAa" },
  { ciudad: "Itap\xFAa Poty", departamento: "Itap\xFAa" },
  { ciudad: "Jes\xFAs de Tavarang\xFC\xE9", departamento: "Itap\xFAa" },
  { ciudad: "Jos\xE9 Leandro Oviedo", departamento: "Itap\xFAa" },
  { ciudad: "La Paz", departamento: "Itap\xFAa" },
  { ciudad: "Mayor Julio Dionisio Ota\xF1o", departamento: "Itap\xFAa" },
  { ciudad: "Natalio", departamento: "Itap\xFAa" },
  { ciudad: "Nueva Alborada", departamento: "Itap\xFAa" },
  { ciudad: "Obligado", departamento: "Itap\xFAa" },
  { ciudad: "Pirap\xF3", departamento: "Itap\xFAa" },
  { ciudad: "San Cosme y Dami\xE1n", departamento: "Itap\xFAa" },
  { ciudad: "San Juan del Paran\xE1", departamento: "Itap\xFAa" },
  { ciudad: "San Pedro del Paran\xE1", departamento: "Itap\xFAa" },
  { ciudad: "San Rafael del Paran\xE1", departamento: "Itap\xFAa" },
  { ciudad: "Tom\xE1s Romero Pereira", departamento: "Itap\xFAa" },
  { ciudad: "Trinidad", departamento: "Itap\xFAa" },
  { ciudad: "Yatytay", departamento: "Itap\xFAa" },
  { ciudad: "Ayolas", departamento: "Misiones" },
  { ciudad: "San Ignacio Guaz\xFA", departamento: "Misiones" },
  { ciudad: "San Juan Bautista", departamento: "Misiones" },
  { ciudad: "San Miguel", departamento: "Misiones" },
  { ciudad: "San Patricio", departamento: "Misiones" },
  { ciudad: "Santa Mar\xEDa de Fe", departamento: "Misiones" },
  { ciudad: "Santa Rosa de Lima", departamento: "Misiones" },
  { ciudad: "Santiago", departamento: "Misiones" },
  { ciudad: "Villa Florida", departamento: "Misiones" },
  { ciudad: "Yabebyry", departamento: "Misiones" },
  { ciudad: "Alberdi", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Cerrito", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Desmochados", departamento: "\xD1eembuc\xFA" },
  { ciudad: "General Jos\xE9 Eduvigis D\xEDaz", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Guaz\xFA Cu\xE1", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Humait\xE1", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Isla Umb\xFA", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Laureles", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Mayor Jos\xE9 Mart\xEDnez", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Paso de Patria", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Pilar", departamento: "\xD1eembuc\xFA" },
  { ciudad: "San Juan Bautista de \xD1eembuc\xFA", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Tacuaras", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Villa Franca", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Villa Oliva", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Villalb\xEDn", departamento: "\xD1eembuc\xFA" },
  { ciudad: "Acahay", departamento: "Paraguar\xED" },
  { ciudad: "Caapuc\xFA", departamento: "Paraguar\xED" },
  { ciudad: "Carapegu\xE1", departamento: "Paraguar\xED" },
  { ciudad: "Escobar", departamento: "Paraguar\xED" },
  { ciudad: "General Bernardino Caballero", departamento: "Paraguar\xED" },
  { ciudad: "La Colmena", departamento: "Paraguar\xED" },
  { ciudad: "Mar\xEDa Antonia", departamento: "Paraguar\xED" },
  { ciudad: "Mbuyapey", departamento: "Paraguar\xED" },
  { ciudad: "Paraguar\xED", departamento: "Paraguar\xED" },
  { ciudad: "Piray\xFA", departamento: "Paraguar\xED" },
  { ciudad: "Quiindy", departamento: "Paraguar\xED" },
  { ciudad: "Quyquyh\xF3", departamento: "Paraguar\xED" },
  { ciudad: "San Roque Gonz\xE1lez de Santa Cruz", departamento: "Paraguar\xED" },
  { ciudad: "Sapucai", departamento: "Paraguar\xED" },
  { ciudad: "Tebicuarym\xED", departamento: "Paraguar\xED" },
  { ciudad: "Yaguar\xF3n", departamento: "Paraguar\xED" },
  { ciudad: "Ybycu\xED", departamento: "Paraguar\xED" },
  { ciudad: "Ybytym\xED", departamento: "Paraguar\xED" },
  { ciudad: "Benjam\xEDn Aceval", departamento: "Presidente Hayes" },
  { ciudad: "Campo Aceval", departamento: "Presidente Hayes" },
  { ciudad: "General Jos\xE9 Mar\xEDa Bruguez", departamento: "Presidente Hayes" },
  { ciudad: "Jos\xE9 Falc\xF3n", departamento: "Presidente Hayes" },
  { ciudad: "Nanawa", departamento: "Presidente Hayes" },
  { ciudad: "Nueva Asunci\xF3n", departamento: "Presidente Hayes" },
  { ciudad: "Puerto Pinasco", departamento: "Presidente Hayes" },
  { ciudad: "Teniente Esteban Mart\xEDnez", departamento: "Presidente Hayes" },
  { ciudad: "Teniente Primero Manuel Irala Fern\xE1ndez", departamento: "Presidente Hayes" },
  { ciudad: "Villa Hayes", departamento: "Presidente Hayes" },
  { ciudad: "Antequera", departamento: "San Pedro" },
  { ciudad: "Capiibary", departamento: "San Pedro" },
  { ciudad: "Chor\xE9", departamento: "San Pedro" },
  { ciudad: "General Elizardo Aquino", departamento: "San Pedro" },
  { ciudad: "General Isidoro Resqu\xEDn", departamento: "San Pedro" },
  { ciudad: "Guayaib\xED", departamento: "San Pedro" },
  { ciudad: "Itacurub\xED del Rosario", departamento: "San Pedro" },
  { ciudad: "Liberaci\xF3n", departamento: "San Pedro" },
  { ciudad: "Lima", departamento: "San Pedro" },
  { ciudad: "Nueva Germania", departamento: "San Pedro" },
  { ciudad: "San Jos\xE9 del Rosario", departamento: "San Pedro" },
  { ciudad: "San Estanislao", departamento: "San Pedro" },
  { ciudad: "San Pablo", departamento: "San Pedro" },
  { ciudad: "San Pedro de Ycuamandiy\xFA", departamento: "San Pedro" },
  { ciudad: "San Vicente Pancholo", departamento: "San Pedro" },
  { ciudad: "Santa Rosa del Aguaray", departamento: "San Pedro" },
  { ciudad: "Tacuat\xED", departamento: "San Pedro" },
  { ciudad: "Uni\xF3n", departamento: "San Pedro" },
  { ciudad: "Veinticinco de Diciembre", departamento: "San Pedro" },
  { ciudad: "Villa del Rosario", departamento: "San Pedro" },
  { ciudad: "Yataity del Norte", departamento: "San Pedro" },
  { ciudad: "Yrybucu\xE1", departamento: "San Pedro" }
];
var DEPARTAMENTOS_PARAGUAY = [
  "Alto Paraguay",
  "Alto Paran\xE1",
  "Amambay",
  "Asunci\xF3n",
  "Boquer\xF3n",
  "Caaguaz\xFA",
  "Caazap\xE1",
  "Canindey\xFA",
  "Central",
  "Concepci\xF3n",
  "Cordillera",
  "Guair\xE1",
  "Itap\xFAa",
  "Misiones",
  "\xD1eembuc\xFA",
  "Paraguar\xED",
  "Presidente Hayes",
  "San Pedro"
];
var norm = (valor) => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
function departamentoDe(ciudad) {
  const buscado = norm(ciudad);
  if (!buscado) return "";
  const fila = CIUDADES_PARAGUAY.find((item) => norm(item.ciudad) === buscado);
  return fila?.departamento || "";
}
function buscarCiudad(texto, limite = 8) {
  const q = norm(texto);
  if (q.length < 2) return [];
  return CIUDADES_PARAGUAY.filter(({ ciudad, departamento }) => norm(ciudad).includes(q) || norm(departamento).includes(q)).sort((a, b) => {
    const aInicio = norm(a.ciudad).startsWith(q) ? 0 : 1;
    const bInicio = norm(b.ciudad).startsWith(q) ? 0 : 1;
    return aInicio - bInicio || a.ciudad.localeCompare(b.ciudad, "es");
  }).slice(0, limite).map(({ ciudad, departamento }) => ({ city: ciudad, department: departamento }));
}

// src/components/CityAutocomplete.jsx
import { jsx as jsx27, jsxs as jsxs21 } from "react/jsx-runtime";
function CityAutocomplete({
  value = "",
  onSelect,
  placeholder = "Ej: Asunci\xF3n, Ciudad del Este\u2026",
  disabled = false,
  className,
  buscar,
  limite = 8,
  maxLength = 100,
  inputProps
}) {
  const [sugerencias, setSugerencias] = useState9([]);
  const [abierto, setAbierto] = useState9(false);
  const timer = useRef5(null);
  const raiz = useRef5(null);
  useEffect4(() => {
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return;
      setAbierto(false);
    };
    document.addEventListener("mousedown", cerrarFuera);
    return () => document.removeEventListener("mousedown", cerrarFuera);
  }, []);
  useEffect4(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  function resolver(texto) {
    const q = String(texto || "").trim();
    if (q.length < 2) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }
    if (!buscar) {
      setSugerencias(buscarCiudad(q, limite));
      setAbierto(true);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const filas = await buscar(q);
        setSugerencias(Array.isArray(filas) ? filas.slice(0, limite) : []);
        setAbierto(true);
      } catch {
        setSugerencias([]);
        setAbierto(false);
      }
    }, 250);
  }
  function change(texto) {
    onSelect?.(texto, departamentoDe(texto));
    resolver(texto);
  }
  function elegir(fila) {
    if (timer.current) clearTimeout(timer.current);
    onSelect?.(fila.city, fila.department || departamentoDe(fila.city));
    setSugerencias([]);
    setAbierto(false);
  }
  function alPerderFoco() {
    const departamento = departamentoDe(value);
    if (departamento) onSelect?.(value, departamento);
  }
  return /* @__PURE__ */ jsxs21("div", { ref: raiz, className: cn("relative", className), children: [
    /* @__PURE__ */ jsx27(
      Input,
      {
        maxLength,
        disabled,
        value,
        onChange: (event) => change(event.target.value),
        onFocus: () => {
          if (value.trim().length >= 2 && sugerencias.length) setAbierto(true);
        },
        onBlur: alPerderFoco,
        placeholder,
        autoComplete: "off",
        "aria-label": "Ciudad",
        role: "combobox",
        "aria-expanded": abierto && sugerencias.length > 0,
        ...inputProps
      }
    ),
    abierto && sugerencias.length > 0 && /* @__PURE__ */ jsx27("ul", { role: "listbox", "aria-label": "Ciudades", className: "absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-ink-500 bg-paper shadow-xl", children: sugerencias.map((fila) => /* @__PURE__ */ jsx27("li", { role: "option", "aria-selected": false, children: /* @__PURE__ */ jsxs21(
      "button",
      {
        type: "button",
        className: "flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-ink-700",
        onMouseDown: (event) => event.preventDefault(),
        onClick: () => elegir(fila),
        children: [
          /* @__PURE__ */ jsx27("span", { className: "truncate font-medium text-fore", children: fila.city }),
          /* @__PURE__ */ jsx27("span", { className: "shrink-0 text-xs text-mute", children: fila.department })
        ]
      }
    ) }, `${fila.city}-${fila.department}`)) })
  ] });
}

// src/utils/tabla.js
var ROTULO_DATO = "text-[10px] font-bold uppercase tracking-wider text-mute";
var CELDA_ENCABEZADO = `truncate ${ROTULO_DATO}`;
var ROTULO_SECCION = "text-xs font-bold uppercase tracking-wider text-mute";
var CELDA_DATO = "truncate text-xs text-mute";
var CELDA_NUMERO = "text-right tabular-nums";
var CELDA_IDENTIDAD = "truncate text-[13px] font-semibold";
var CELDA_IDENTIDAD_GRANDE = "truncate text-sm font-semibold";

// src/utils/nombre.js
var PARTICULAS = /* @__PURE__ */ new Set(["de", "del", "la", "las", "los", "y", "e", "da", "das", "do", "dos", "van", "von", "san", "santa"]);
var titulo = (palabra) => {
  const limpia = String(palabra || "").toLowerCase();
  if (!limpia) return "";
  if (PARTICULAS.has(limpia)) return limpia;
  return limpia.charAt(0).toUpperCase() + limpia.slice(1);
};
var estaEnMayusculas = (texto) => texto === texto.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(texto);
var TIPO_SOCIETARIO = /\b(S\.?A\.?|S\.?R\.?L\.?|S\.?A\.?C\.?I\.?|S\.?A\.?E\.?|S\.?A\.?S\.?|LTDA\.?|E\.?A\.?S\.?|C[IÍ]A\.?|SOCIEDAD|EMPRESA|COMPA[ÑN][IÍ]A|COOPERATIVA|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|MUNICIPALIDAD|GOBERNACI[OÓ]N|MINISTERIO|UNIVERSIDAD|COLEGIO|CONSORCIO)\b/i;
function esRazonSocial(texto) {
  return TIPO_SOCIETARIO.test(String(texto || ""));
}
function nombrePartes(texto) {
  const limpio = String(texto ?? "").replace(/\s+/g, " ").trim();
  if (!limpio) return { nombres: [], apellidos: [], conComa: false };
  if (limpio.includes(",")) {
    const [apellidos, nombres] = limpio.split(",", 2).map((parte) => parte.trim());
    return {
      nombres: String(nombres || "").split(" ").filter(Boolean),
      apellidos: String(apellidos || "").split(" ").filter(Boolean),
      conComa: true
    };
  }
  return { nombres: limpio.split(" ").filter(Boolean), apellidos: [], conComa: false };
}
function normalizarNombre(texto, { apellidosPrimero = "auto" } = {}) {
  const original = String(texto ?? "").replace(/\s+/g, " ").trim();
  if (!original) return "";
  if (esRazonSocial(original)) return original;
  const partes = nombrePartes(original);
  const mayusculas = estaEnMayusculas(original);
  const reordenar = !partes.conComa && (apellidosPrimero === true || apellidosPrimero === "sifen" && mayusculas && partes.nombres.length >= 3);
  if (!partes.conComa && !reordenar && !mayusculas) return original;
  let ordenadas;
  if (partes.conComa) {
    ordenadas = [...partes.nombres, ...partes.apellidos];
  } else if (reordenar) {
    const corte = partes.nombres.length >= 4 ? 2 : partes.nombres.length - 1;
    ordenadas = [...partes.nombres.slice(corte), ...partes.nombres.slice(0, corte)];
  } else {
    ordenadas = partes.nombres;
  }
  return ordenadas.map(titulo).filter(Boolean).join(" ");
}
function esApellidosPrimero(texto) {
  return String(texto ?? "").includes(",");
}

// src/printing/escpos.js
var CP850 = {
  "\xE1": 160,
  "\xE9": 130,
  "\xED": 161,
  "\xF3": 162,
  "\xFA": 163,
  "\xFC": 129,
  "\xF1": 164,
  "\xD1": 165,
  "\xC1": 181,
  "\xC9": 144,
  "\xCD": 214,
  "\xD3": 224,
  "\xDA": 233,
  "\xDC": 154,
  "\xBF": 168,
  "\xA1": 173,
  "\xB0": 248,
  "\xB7": 250,
  "\xAC": 172,
  "\xBC": 172,
  "\xBD": 171
};
var SUSTITUCIONES = { "\u2192": "->", "\u2190": "<-", "\u2026": "...", "\u2013": "-", "\u2014": "-", "\u2019": "'", "\u2018": "'", "\u201C": '"', "\u201D": '"', "\xD7": "x", "\u2022": "-", "\u2713": "v", "\xA0": " ", "\u202F": " " };
var normalizarParaImpresora = (texto) => String(texto ?? "").replace(/[→←…–—’‘“”×•✓\u00a0\u202f]/g, (caracter) => SUSTITUCIONES[caracter] ?? caracter);
var ESC = 27;
var GS = 29;
var CORTES = {
  "completo": [GS, 86, 0],
  "parcial": [GS, 86, 1],
  "avanza-completo": [GS, 86, 65, 0],
  "avanza-parcial": [GS, 86, 66, 0]
};
var VARIANTES_CORTE = Object.keys(CORTES);
var bytesDeTexto = (texto) => {
  const salida = [];
  for (const caracter of normalizarParaImpresora(texto)) {
    const codigo = CP850[caracter];
    if (codigo !== void 0) {
      salida.push(codigo);
      continue;
    }
    const punto = caracter.codePointAt(0);
    salida.push(punto > 255 ? 63 : punto);
  }
  return salida;
};
var columnasDeAncho = (ancho = 58) => Number(ancho) >= 80 ? 48 : 32;
function envolver(texto, columnas) {
  const lineas = [];
  for (const parrafo of String(texto ?? "").split("\n")) {
    let actual = "";
    for (const palabra of parrafo.split(/\s+/).filter(Boolean)) {
      let resto = palabra;
      while (resto.length > columnas) {
        if (actual) {
          lineas.push(actual);
          actual = "";
        }
        lineas.push(resto.slice(0, columnas));
        resto = resto.slice(columnas);
      }
      if (!actual) actual = resto;
      else if (actual.length + 1 + resto.length <= columnas) actual += ` ${resto}`;
      else {
        lineas.push(actual);
        actual = resto;
      }
    }
    lineas.push(actual);
  }
  return lineas;
}
function repartirLinea(izquierda, derecha, columnas) {
  const izq = String(izquierda ?? "");
  const der = String(derecha ?? "");
  if (izq.length + der.length + 1 > columnas) {
    const recorte = Math.max(0, columnas - der.length - 1);
    return `${izq.slice(0, recorte)} ${der}`.trimEnd();
  }
  return `${izq}${" ".repeat(columnas - izq.length - der.length)}${der}`;
}
function crearTicket({ ancho = 80, margen = 2 } = {}) {
  const columnasBase = columnasDeAncho(ancho);
  const sangria = Math.max(0, Math.min(6, Number(margen) || 0));
  const columnas = columnasBase - sangria * 2;
  const prefijo = " ".repeat(sangria);
  const partes = [];
  const espejo = [];
  let doble = false;
  let conCorte = false;
  const anchoActual = () => doble ? Math.floor(columnas / 2) : columnas;
  const escribir = (texto) => {
    const linea = `${prefijo}${texto}`;
    espejo.push(linea);
    partes.push(...bytesDeTexto(linea));
  };
  const centrar = (texto) => {
    const recorte = String(texto).slice(0, anchoActual());
    const aire = Math.max(0, Math.floor((anchoActual() - recorte.length) / 2));
    return `${" ".repeat(aire)}${recorte}`;
  };
  const espejoCentrado = (texto) => espejo.push(`${prefijo}${centrar(texto)}
`);
  const api = {
    columnas,
    iniciar() {
      partes.push(ESC, 64);
      partes.push(ESC, 116, 2);
      partes.push(ESC, 97, 0);
      return api;
    },
    texto(texto = "") {
      for (const linea of envolver(texto, anchoActual())) {
        escribir(`${linea}
`);
      }
      return api;
    },
    linea(caracter = "-") {
      escribir(`${String(caracter).repeat(anchoActual())}
`);
      return api;
    },
    par(izquierda, derecha = "") {
      escribir(`${repartirLinea(izquierda, derecha, anchoActual())}
`);
      return api;
    },
    centrado(texto = "") {
      const anchoVisual = doble ? columnas : anchoActual();
      for (const linea of envolver(texto, anchoActual())) {
        const largo = doble ? linea.length * 2 : linea.length;
        const margen2 = Math.max(0, Math.floor((anchoVisual - largo) / 2));
        escribir(`${" ".repeat(margen2)}${linea}
`);
      }
      return api;
    },
    negrita(activo = true) {
      partes.push(ESC, 69, activo ? 1 : 0);
      return api;
    },
    doble(activo = true) {
      doble = Boolean(activo);
      partes.push(GS, 33, activo ? 17 : 0);
      return api;
    },
    // QR nativo de la impresora (modelo 2). `tamano` va de 1 a 16; `etiqueta`
    // imprime un rótulo centrado arriba del código.
    qr(datos, { tamano = 6, etiqueta = "" } = {}) {
      if (etiqueta) escribir(`${centrar(etiqueta)}
`);
      espejoCentrado(`[QR] ${String(datos).slice(0, 48)}`);
      partes.push(ESC, 97, 1);
      const contenido = bytesDeTexto(datos);
      const parameterLength = contenido.length + 3;
      const parameterLengthLow = parameterLength % 256;
      const parameterLengthHigh = Math.floor(parameterLength / 256);
      const modulo = Math.min(16, Math.max(1, Number(tamano) || 6));
      partes.push(GS, 40, 107, 4, 0, 49, 65, 50, 0);
      partes.push(GS, 40, 107, 3, 0, 49, 67, modulo);
      partes.push(GS, 40, 107, 3, 0, 49, 69, 49);
      partes.push(GS, 40, 107, parameterLengthLow, parameterLengthHigh, 49, 80, 48, ...contenido);
      partes.push(GS, 40, 107, 3, 0, 49, 81, 48);
      partes.push(ESC, 97, 0);
      return api;
    },
    // Código de barras. CODE128 (GS k 73: incluye el largo) con el juego de
    // códigos B declarado como {B, o EAN-13 nativo (GS k 67: 12 dígitos, la
    // impresora calcula el verificador). `datos` ya viene normalizado por quien
    // llama (ver codigos.js): módulo 2 = barras legibles por lectores de local.
    barcode(datos, { etiqueta = "", formato = "code128" } = {}) {
      if (etiqueta) escribir(`${centrar(etiqueta)}
`);
      espejoCentrado(`[BARRA] ${datos}`);
      partes.push(ESC, 97, 1);
      partes.push(GS, 104, 80);
      partes.push(GS, 119, 2);
      partes.push(GS, 72, 2);
      if (String(formato).toLowerCase() === "ean13") {
        const contenido = bytesDeTexto(String(datos).replace(/\D/g, "").slice(0, 12));
        if (contenido.length === 12) partes.push(GS, 107, 67, 12, ...contenido);
      } else {
        const contenido = [123, 66, ...bytesDeTexto(datos)];
        if (contenido.length && contenido.length <= 255) partes.push(GS, 107, 73, contenido.length, ...contenido);
      }
      partes.push(ESC, 97, 0);
      return api;
    },
    // Imagen raster monocroma (GS v 0): `bytes` viene empaquetado en filas de
    // ancho/8 bytes con 1 = punto negro. `ancho` en píxeles (múltiplo de 8).
    imagenRaster(bytes, { ancho: ancho2 = 0, alto = 0 } = {}) {
      const anchoBytes = Math.ceil(Number(ancho2) / 8);
      const filas = Number(alto);
      if (!bytes?.length || !anchoBytes || !filas || bytes.length < anchoBytes * filas) return api;
      espejoCentrado("[LOGO]");
      partes.push(ESC, 97, 1);
      partes.push(GS, 118, 48, 0, anchoBytes % 256, Math.floor(anchoBytes / 256), filas % 256, Math.floor(filas / 256), ...bytes.slice(0, anchoBytes * filas));
      partes.push(ESC, 97, 0);
      return api;
    },
    avanza(lineas = 1) {
      const cuantas = Math.min(255, Math.max(1, Number(lineas) || 1));
      partes.push(ESC, 100, cuantas);
      espejo.push("\n".repeat(cuantas));
      return api;
    },
    // Corte GS V según el estándar ESC/POS (sin `ESC i`): alimenta 4 líneas y
    // corta. `variante` permite probar la que soporte el firmware:
    // completo · parcial · avanza-completo · avanza-parcial.
    corte(variante = "completo") {
      conCorte = true;
      espejoCentrado(variante === "completo" ? "[CORTE]" : `[CORTE: ${variante}]`);
      partes.push(ESC, 100, 4);
      partes.push(...CORTES[variante] || CORTES.completo);
      return api;
    },
    corteEnviado() {
      return conCorte;
    },
    bytes() {
      return new Uint8Array(partes);
    },
    base64() {
      let binario = "";
      for (const byte of partes) binario += String.fromCharCode(byte);
      return btoa(binario);
    },
    lineas() {
      return [...espejo];
    }
  };
  return api;
}
var AVANCES_FIRMA = 3;
function bloqueFirma(t, roles = [], { ancho = 80, observaciones = true } = {}) {
  const corto = Number(ancho) <= 58;
  for (const rol of roles) {
    t.avanza(1);
    t.texto(`${rol}:`);
    t.avanza(AVANCES_FIRMA);
    t.linea();
    t.texto(corto ? "Aclaraci\xF3n: ______________" : "Aclaraci\xF3n: ______________________________");
    if (corto) {
      t.texto("CI: ______________________");
      t.texto("Fecha: ____/____/_________");
    } else {
      t.texto("CI: __________________  Fecha: ___/___/______");
    }
  }
  if (observaciones) {
    t.avanza(1);
    t.texto("Observaciones:");
    t.avanza(2);
  }
}

// src/printing/prueba.js
var TIPOS_PRUEBA = {
  corta: "Prueba corta",
  pedido: "Ticket de pedido",
  qr: "Ticket con QR",
  venta: "Ticket completo de venta",
  caracteres: "Caracteres y formato",
  corte: "Prueba de corte"
};
var TIPOS_TICKET_PRUEBA = TIPOS_PRUEBA;
var azar = (max) => Math.floor(Math.random() * max);
var validacionDe = () => String(azar(1e4)).padStart(4, "0");
var sufijoDe = () => String(azar(10));
var refDePrueba = () => `TEST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
var fechaCorta = (iso) => new Date(iso).toLocaleString("es-PY", { dateStyle: "short", timeStyle: "short" });
function paginaDePrueba({
  tipo = "caracteres",
  ancho = 80,
  impresora = "",
  nombre = "",
  equipo = "",
  copias = 1,
  metodo = "",
  conexion = "",
  puente = "",
  tokenPista = "",
  usuario = "",
  marca = "",
  nombreApp = "OwnCoding",
  validacion: validacionFija = "",
  qr = null
} = {}) {
  const metodoReal = metodo || (/^(usb|cups):/.test(String(impresora || "")) ? "CUPS (cola local)" : "LAN (TCP directo)");
  const conexionReal = /^(usb|cups)/.test(String(conexion || "")) ? "Cola CUPS local" : "LAN (TCP directo)";
  const validacion = validacionFija || validacionDe();
  const sufijo = sufijoDe();
  const validador = `${validacion}-${sufijo}`;
  const ref = refDePrueba();
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  const t = crearTicket({ ancho }).iniciar();
  const pie = () => {
    t.linea();
    t.negrita().centrado(`VALIDACI\xD3N ${validador}`).negrita(false);
    t.linea();
    t.par("Impresora", nombre || "\u2014");
    t.par("M\xE9todo", metodoReal);
    t.par("Conexi\xF3n", conexionReal);
    t.par("Destino", impresora || "\u2014");
    t.par("Puente", puente || "\u2014");
    t.par("Token", tokenPista || "sin token");
    t.par("Ancho", `${ancho} mm`);
    t.par("Copias", String(copias));
    t.par("Usuario", usuario || "\u2014");
    t.par("Fecha", fechaCorta(ahora));
    t.par("Equipo", equipo || "\u2014");
    t.par("Trabajo", ref);
  };
  const codigos = (etiqueta) => {
    t.linea();
    t.centrado("Escanear");
    const contenido = qr ? qr({ destino: impresora, validacion, fecha: ahora, tipo }) : `OWNCODING:PRUEBA:${etiqueta}:${validacion}`;
    if (contenido) t.qr(contenido, { tamano: 6, etiqueta: "QR" });
    t.barcode(`OC-${etiqueta}-${validacion}`, { etiqueta: "C\xF3digo de barras" });
    t.linea();
    t.texto("Acentos: \xE1 \xE9 \xED \xF3 \xFA \xFC \xF1 \xD1 \xBF? \xA1!");
  };
  t.centrado(nombreApp).negrita().doble().centrado("TICKET DE PRUEBA").doble(false).negrita(false);
  t.centrado(TIPOS_PRUEBA[tipo] || "Prueba");
  if (marca) t.centrado(`Comparativa ${marca}`);
  t.linea();
  t.negrita().doble().centrado(`VALIDACI\xD3N ${validador}`).doble(false).negrita(false);
  t.linea();
  if (tipo === "corta") {
    t.par("Prueba", metodoReal);
    t.par("Destino", impresora || "\u2014");
    t.par("Resultado", "PENDIENTE");
    codigos("CORTA");
  }
  if (tipo === "pedido") {
    t.par("Pedido", `P-${validacionDe()}`);
    t.par("Cliente", "Cliente de prueba");
    t.linea();
    t.texto("iPhone 16 Pro 128GB");
    t.par("  x1", "7.950.000");
    t.texto("Case MagSafe silicona");
    t.par("  x1", "180.000");
    t.texto("L\xE1mina 9H");
    t.par("  x2", "60.000");
    t.linea();
    t.par("Subtotal", "8.250.000");
    t.par("Descuento", "-250.000");
    t.negrita().par("Total", "8.000.000").negrita(false);
    t.par("Medio de pago", "Efectivo");
    t.par("Vendedor", "Vendedor de prueba");
    codigos("PEDIDO");
  }
  if (tipo === "qr") {
    t.par("Pedido", `P-${validacionDe()}`);
    t.par("Cliente", "Cliente de prueba");
    t.negrita().par("Total", "1.234.000").negrita(false);
    codigos("QR");
  }
  if (tipo === "venta") {
    t.centrado(`${nombreApp} \xB7 SUCURSAL CENTRAL`).centrado("Comprobante de venta");
    t.linea();
    t.par("Fecha", fechaCorta(ahora));
    t.par("Vendedor", "Vendedor de prueba");
    t.par("Cliente", "Cliente de prueba");
    t.linea();
    t.texto("iPhone 16 Pro 128GB");
    t.par("  x1", "7.950.000");
    t.texto("Case MagSafe silicona");
    t.par("  x1", "180.000");
    t.linea();
    t.par("Subtotal", "8.130.000");
    t.par("IVA 10%", "813.000");
    t.negrita().par("Total", "8.943.000").negrita(false);
    t.par("Medio de pago", "Transferencia");
    codigos("VENTA");
  }
  if (tipo === "caracteres") {
    t.texto("Texto normal");
    t.negrita().texto("Negrita").negrita(false);
    t.doble().par("DOBLE", "123").doble(false);
    t.centrado("Centrado");
    t.par("Columna izquierda", "derecha");
    codigos("CHARS");
  }
  if (tipo === "corte") {
    t.par("Prueba", "Corte f\xEDsico por variantes");
    t.linea();
    t.texto("Cada secci\xF3n etiquetada intenta un corte distinto: mir\xE1 en qu\xE9 secci\xF3n se separ\xF3 el papel.");
    t.linea();
    t.centrado("1) GS V 0 \xB7 completo");
    t.texto("Corte completo puro (el est\xE1ndar de recibos).");
    t.avanza(1).corte("completo");
    t.centrado("2) GS V 1 \xB7 parcial");
    t.texto("Corte parcial: deja una tirita sin cortar.");
    t.avanza(1).corte("parcial");
    t.centrado("3) GS V 65 0 \xB7 avanza + completo");
    t.texto("Primero avanza hasta la cuchilla y despu\xE9s corta todo.");
    t.avanza(1).corte("avanza-completo");
    t.centrado("4) GS V 66 0 \xB7 avanza + parcial");
    t.texto("Avanza hasta la cuchilla y corta parcial.");
    t.avanza(1).corte("avanza-parcial");
    t.linea();
    t.texto("Si ninguna cort\xF3, revis\xE1 Cutter Enable: YES y que el rollo est\xE9 bien cargado.");
    codigos("CORTE");
  }
  pie();
  t.avanza(2).corte();
  return { base64: () => t.base64(), lineas: () => t.lineas(), ref, validacion, sufijo, validador, corte: t.corteEnviado() };
}
function paginaDePruebaSimple(opciones = {}) {
  return paginaDePrueba({ ...opciones, tipo: "caracteres" });
}

// src/utils/formulario.js
var GRILLA_DOS_COLUMNAS = "grid gap-3 sm:grid-cols-2";
var GRILLA_DOS_COLUMNAS_COMPACTA = "grid gap-2 sm:grid-cols-2";
var PIE_ACCIONES = "flex flex-wrap justify-end gap-2";
var PIE_ACCIONES_REVERSO = "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end";

// src/catalog/productos.js
var MODELOS_IPHONE = [
  // Generación actual y anteriores (del más nuevo al más viejo)
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17 Plus",
  "iPhone 17",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13 mini",
  "iPhone 13",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12 mini",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XS Max",
  "iPhone XS",
  "iPhone XR",
  "iPhone X",
  "iPhone 8 Plus",
  "iPhone 8",
  "iPhone 7 Plus",
  "iPhone 7",
  "iPhone SE (3.\xAA generaci\xF3n)",
  "iPhone SE (2.\xAA generaci\xF3n)"
];
var CAPACIDADES_IPHONE = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
var COLORES_IPHONE = [
  "Negro",
  "Blanco",
  "Plata",
  "Gris espacial",
  "Dorado",
  "Azul",
  "Verde",
  "Rojo",
  "Rosa",
  "Morado",
  "Amarillo",
  "Titanio natural",
  "Titanio azul",
  "Titanio blanco",
  "Titanio negro",
  "Titanio desierto"
];
var CATEGORIAS_ACCESORIOS = [
  "Fundas",
  "Vidrios templados",
  "Cargadores",
  "Cables",
  "Auriculares",
  "Bater\xEDas",
  "Parlantes",
  "Relojes y correas",
  "Soportes",
  "Power banks",
  "Adaptadores",
  "L\xE1pices y stylus",
  "Memorias y almacenamiento",
  "C\xE1maras y accesorios",
  "Repuestos",
  "Otros accesorios"
];
var MARCAS_ACCESORIOS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "JBL",
  "Baseus",
  "Anker",
  "Hoco",
  "Generic",
  "Otro"
];
function buscarEnCatalogo(catalogo = [], texto = "") {
  const norm2 = (valor) => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const q = norm2(texto);
  if (!q) return catalogo;
  return catalogo.filter((item) => norm2(item).includes(q));
}

// src/utils/fecha.js
var ES_PY = "es-PY";
var OPCIONES_HORA = { hour12: false };
function fechaValida(value) {
  if (!value) return null;
  const fecha = value instanceof Date ? value : new Date(value);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}
function fechaHora(value, vacio = "\u2014") {
  const fecha = fechaValida(value);
  return fecha ? fecha.toLocaleString(ES_PY, { dateStyle: "short", timeStyle: "short", ...OPCIONES_HORA }) : vacio;
}
function fechaDia(value, vacio = "\u2014") {
  const fecha = fechaValida(value);
  return fecha ? fecha.toLocaleDateString(ES_PY) : vacio;
}
function fechaHoraCorta(value, vacio = "\u2014") {
  const fecha = fechaValida(value);
  return fecha ? fecha.toLocaleString(ES_PY, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", ...OPCIONES_HORA }) : vacio;
}
function fechaCorta2(value, vacio = "\u2014") {
  const fecha = fechaValida(value);
  if (!fecha) return vacio;
  const dia = fecha.toLocaleDateString(ES_PY, { day: "2-digit", month: "short" });
  const hora = fecha.toLocaleTimeString(ES_PY, { hour: "2-digit", minute: "2-digit", ...OPCIONES_HORA });
  return `${dia} \xB7 ${hora}`;
}

// src/utils/serial.js
function ultimos4(serial) {
  return String(serial ?? "").slice(-4);
}
function partirSerial(serial) {
  const texto = String(serial ?? "");
  if (!texto) return { cabeza: "", cola: "" };
  return { cabeza: texto.slice(0, -4), cola: texto.slice(-4) };
}
function serialEnmascarado(serial) {
  const cola = ultimos4(serial);
  return cola ? `\u2022\u2022\u2022\u2022${cola}` : "";
}
export {
  AVANCES_FIRMA,
  AjustesImpresion,
  AuthLayout,
  Aviso,
  BANCOS_PARAGUAY,
  Badge,
  BancoCombobox,
  BancoLogo,
  BarraProgreso,
  BotonDentroCampo,
  BotonImprimir,
  Button,
  CAPACIDADES_IPHONE,
  CATEGORIAS_ACCESORIOS,
  CELDA_DATO,
  CELDA_ENCABEZADO,
  CELDA_IDENTIDAD,
  CELDA_IDENTIDAD_GRANDE,
  CELDA_NUMERO,
  CIUDADES_PARAGUAY,
  CODIGOS_PAIS,
  COLORES_BANCO_RESPALDO,
  COLORES_IPHONE,
  Card,
  CeldaMoneda,
  CityAutocomplete,
  ConfirmDialog,
  CurrencySelect,
  DEPARTAMENTOS_PARAGUAY,
  DOMINIOS_EMAIL,
  DataTable,
  Dot,
  Drawer,
  ESTADO_IMPRESORA,
  ETIQUETA_ESTADO,
  ETIQUETA_TRABAJO,
  EmailField,
  EmptyState,
  ErrorState,
  Eyebrow,
  FilaDato,
  FormField,
  GRILLA_DOS_COLUMNAS,
  GRILLA_DOS_COLUMNAS_COMPACTA,
  GoogleButton,
  GoogleMark,
  Icon,
  IconAction,
  Input,
  InstagramField,
  LIMITE_MONTO_GENERAL,
  LIMITE_MONTO_VENTAS,
  LOGOS_BANCOS,
  Label,
  ListGridToggle,
  LoadingScreen,
  MARCAS_ACCESORIOS,
  MENSAJE_TELEFONO,
  MODELOS_IPHONE,
  MenuDesplegable,
  Modal,
  Money,
  MoneyInput,
  NavLateral,
  OAuthDivider,
  PIE_ACCIONES,
  PIE_ACCIONES_REVERSO,
  PageHeader,
  PanelDerecho,
  PasswordInput,
  PegarEnlaceToken,
  PercentField,
  PhoneField,
  PinInput,
  ProductFooter,
  ROTULO_DATO,
  ROTULO_SECCION,
  SearchField_default as SearchField,
  SegmentedField,
  Select,
  SerialField,
  Skeleton,
  Stat,
  Subtabs,
  Switch,
  TAMANOS_CAMPO,
  TAMANOS_MODAL,
  TAMANO_MODAL_PREDETERMINADO,
  TIPOS_PRUEBA,
  TIPOS_TICKET_PRUEBA,
  TONO_ESTADO,
  TarjetaAjuste,
  Textarea,
  ToastProvider,
  VARIANTES_CORTE,
  agregarEstado,
  anchoParaLargo,
  bloqueFirma,
  buscarCiudad,
  buscarEnCatalogo,
  cn,
  codigoPais,
  colorDeBanco,
  colorTrabajo,
  columnasDeAncho,
  componerTelefono,
  conexionDeDestino,
  crearTicket,
  departamentoDe,
  destinoDeConexion,
  envolver,
  esApellidosPrimero,
  esRazonSocial,
  esToken,
  estadoDeDiagnostico,
  etiquetaTrabajo,
  excedeMonto,
  extractTokenFromUrl,
  fechaCorta2 as fechaCorta,
  fechaDia,
  fechaHora,
  fechaHoraCorta,
  fechaValida,
  formatGs,
  formatGsInput,
  formatMoney,
  formatPercent,
  formatUsd,
  formatUsdInput,
  inicialesDeBanco,
  internationalPhone,
  largoMaximoMonto,
  limpiarPercent,
  logoDeBanco,
  montoGs,
  montoTexto,
  montoUsd,
  motivoDeDiagnostico,
  nombrePartes,
  normalizarBanco,
  normalizarInstagram,
  normalizarNombre,
  normalizarSerial,
  normalizarTelefono,
  paginaDePrueba,
  paginaDePruebaSimple,
  parseGsInput,
  parsePercent,
  parseTelefono,
  parseUsdInput,
  partirSerial,
  primerNombre,
  repartirLinea,
  serialEnmascarado,
  soloDigitos,
  sugerenciasDe,
  sugerenciasDeBanco,
  telefonoValido,
  telefonoVisible,
  textoVerificacion,
  ultimos4,
  useToast,
  whatsappUrl
};
//# sourceMappingURL=index.js.map
