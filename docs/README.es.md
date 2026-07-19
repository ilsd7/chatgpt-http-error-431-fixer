# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **Funcionamiento local** · **Sin acceso a la red** · **Privacidad ante todo**

Evita la aparición repetida de HTTP ERROR 431 al usar ChatGPT mediante la limpieza segura de las cookies acumuladas de los chats temporales.

Los chats temporales crean continuamente cookies `conv_key_*` que caducan un mes después. Con un uso frecuente pueden acumularse decenas, o incluso más, hacer que la cabecera de las solicitudes sea demasiado grande y provocar HTTP ERROR 431 en Chromium (`Request Header Fields Too Large`). El proyecto elimina únicamente esas cookies acumuladas; no modifica las cookies de inicio de sesión ni ninguna otra cookie de ChatGPT.

## Descarga e instalación

Descarga los archivos desde la [última versión publicada en GitHub](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest).

La extensión descomprimida y el userscript no se actualizan automáticamente. Instala manualmente cada nueva versión.

### Chromium: extensión del navegador

Usa la extensión si quieres que la limpieza sea automática. Requiere Chromium 119 o posterior.

1. Descarga el ZIP de la extensión desde los archivos de la versión y descomprímelo.
2. Abre `chrome://extensions`.
3. Activa el **Modo de desarrollador**.
4. Selecciona **Cargar descomprimida** y elige la carpeta extraída.

La extensión elimina las cookies objetivo al iniciar el navegador y vuelve a comprobarlas tres horas después de cada limpieza correcta. Si hay una pestaña de chat temporal abierta, espera 30 minutos antes de intentarlo de nuevo. También puedes pulsar el botón de la barra de herramientas para realizar la misma comprobación y limpieza cuando quieras.

Firefox no puede ejecutar esta extensión porque no admite los service workers en segundo plano de Manifest V3. Utiliza el userscript en su lugar.

### Firefox o limpieza manual: userscript

Usa el userscript si prefieres decidir cuándo se eliminan las cookies. Nunca las borra automáticamente. En Chromium, da prioridad a la extensión anterior y usa Tampermonkey Beta solo si necesitas una limpieza manual.

Violentmonkey 2.43.x y 2.44.0 no pueden enumerar cookies en Chromium 150 porque añaden `firstPartyDomain`, una propiedad exclusiva de Firefox, a la solicitud de la API de cookies de Chromium. Un userscript no puede eliminar un campo añadido dentro del service worker del gestor. Usa la extensión de Chromium o Tampermonkey Beta.

1. En Firefox, instala [Violentmonkey](https://violentmonkey.github.io/). En Chromium, instala Tampermonkey Beta solo si no utilizas la extensión.
2. En Chromium 138 o posterior, abre los detalles de la extensión del gestor de userscripts y activa **Allow User Scripts**.
3. Descarga `chatgpt-http-error-431-fixer.user.js` desde los archivos de la versión.
4. Importa el archivo descargado en el gestor de userscripts, o crea un script nuevo y pega su contenido.

Una vez instalado, aparecen estos comandos en el menú del gestor de userscripts:

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

Las cookies objetivo son HttpOnly. Si usas Violentmonkey en Firefox, activa estas dos opciones:

1. Opción avanzada global: **Allow GM_cookie to access HTTP-only cookies**
2. Opción del script: **Allow access to HTTP-only cookies**

Es un permiso potente. Concédelo únicamente a scripts que hayas revisado y en los que confíes.

A fecha de julio de 2026, Violentmonkey es la opción recomendada para Firefox. En Chromium se recomienda la extensión del navegador; Tampermonkey Beta también permite la limpieza manual, pero este proyecto no lo prueba periódicamente. Tampermonkey estable y FireMonkey no pueden acceder a las cookies HttpOnly objetivo.

## Cookies que se eliminan

Una cookie solo se elimina si cumple las dos condiciones siguientes:

- Su dominio normalizado es exactamente `chatgpt.com`.
- Su nombre empieza por `conv_key_`.

La extensión comprueba las cookies normales y las particionadas. El userscript consulta las cookies normales y la partición de ChatGPT, y solo empieza a eliminar si ambas consultas tienen éxito. Si únicamente no está disponible la consulta de la partición, **Count** indica expresamente que el recuento solo incluye las cookies normales. Las cookies de inicio de sesión y las demás cookies de ChatGPT nunca se eliminan.

## Privacidad y seguridad

Todo se ejecuta de forma local. No hay analíticas, telemetría, código remoto, bibliotecas externas ni solicitudes de red iniciadas por las herramientas. Los valores de las cookies nunca se guardan, registran, muestran ni envían.

La extensión solo solicita estos permisos:

- `cookies` para encontrar y eliminar las cookies coincidentes de `chatgpt.com`
- `alarms` para programar comprobaciones a las tres horas y reintentos a los 30 minutos
- `storage` para recordar la hora de la última limpieza correcta
- `https://chatgpt.com/*` para limitar el acceso a cookies y pestañas de ChatGPT

No es necesario compilar. Los archivos publicados contienen el código fuente del repositorio sin minificar ni transformar, de modo que puedes revisarlo antes de instalarlo. No hay un proceso adicional de verificación de binarios.

Consulta la [Política de seguridad](../SECURITY.md) para informar de vulnerabilidades.

## Licencia

Se distribuye bajo la [Licencia Apache 2.0](../LICENSE).

## Notas

Esta herramienta no corrige todas las causas de HTTP ERROR 431. Solo sirve cuando la causa es la acumulación de cookies de los chats temporales.

ChatGPT es una marca de OpenAI. Este es un proyecto personal e independiente.
