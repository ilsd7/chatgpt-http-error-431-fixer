# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **Funcionamiento local** · **Sin acceso a la red** · **Privacidad ante todo**

Una pequeña herramienta que limpia de forma segura las cookies acumuladas de los chats temporales para evitar que HTTP ERROR 431 vuelva a aparecer al usar ChatGPT.

Los chats temporales crean continuamente cookies `conv_key_*` que caducan un mes después. Con un uso frecuente pueden acumularse decenas, o incluso más, hacer que la cabecera de las solicitudes sea demasiado grande y provocar HTTP ERROR 431 en Chromium (`Request Header Fields Too Large`). El proyecto elimina únicamente esas cookies acumuladas; no modifica las cookies de inicio de sesión ni ninguna otra cookie de ChatGPT.

## Descarga e instalación

Descarga los archivos desde la [última versión publicada en GitHub](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest).

La extensión descomprimida y el userscript no se actualizan automáticamente. Instala manualmente cada nueva versión.

### Chromium: extensión del navegador

Usa la extensión si quieres que la limpieza sea automática. Requiere Chromium 119 o posterior.

1. Descarga el ZIP de la extensión desde los archivos de la versión y descomprímelo.
2. Abre `chrome://extensions`.
3. Activa el **Modo de desarrollador**.
4. Selecciona **Cargar descomprimida** y elige la carpeta extraída, o arrastra esa carpeta a la página de extensiones.

Justo después de instalarse, la extensión comprueba si hay alguna pestaña de chat temporal abierta y solo elimina las cookies objetivo si no hay ninguna. Tras una limpieza correcta, vuelve a comprobarlas tres horas después. Si en ese momento hay una pestaña de chat temporal abierta, no elimina nada y comprueba cada 30 minutos hasta que se cierre. También elimina inmediatamente las cookies objetivo cuando vuelves a iniciar el navegador después de cerrarlo por completo. Al pulsar el botón de la barra de herramientas, la extensión comprueba primero si hay alguna pestaña de chat temporal abierta; si no la hay, elimina inmediatamente las cookies objetivo y muestra en la insignia cuántas ha eliminado. Si hay una pestaña de chat temporal abierta, no elimina nada.

Firefox no puede ejecutar esta extensión porque no admite los service workers en segundo plano de Manifest V3. Utiliza el userscript en su lugar.

### Firefox o limpieza manual: userscript

Si usas Firefox o prefieres no instalar la extensión del navegador, puedes utilizar el userscript. El userscript no permite la limpieza automática. La limpieza manual se ejecuta independientemente de que haya una pestaña de chat temporal abierta, así que tenlo en cuenta. En Chromium se recomienda la extensión anterior.

Actualmente, Violentmonkey no puede enumerar cookies en Chromium 150 porque añade `firstPartyDomain`, una propiedad exclusiva de Firefox, a la solicitud de la API de cookies de Chromium.

1. En Firefox, instala [Violentmonkey](https://violentmonkey.github.io/) o [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=firefox). En Chromium, instala [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=chrome) si no utilizas la extensión.
2. En Chromium 138 o posterior, abre los detalles de la extensión del gestor de userscripts y activa **Allow User Scripts**.
3. Descarga `chatgpt-http-error-431-fixer.user.js` desde los archivos de la versión.
4. Importa el archivo descargado en el gestor de userscripts, o crea un script nuevo y pega su contenido.

Una vez instalado, aparecen estos comandos en el menú del gestor de userscripts:

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

Como las cookies objetivo son HttpOnly, es necesario usar la versión Beta de Tampermonkey. Si usas Violentmonkey en Firefox, activa estas dos opciones:

1. Opción avanzada global: **Allow GM_cookie to access HTTP-only cookies**
2. Opción del script: **Allow access to HTTP-only cookies**

Es un permiso potente. Concédelo únicamente a scripts que hayas revisado y en los que confíes.

A fecha de julio de 2026, en Firefox se puede usar Violentmonkey o Tampermonkey Beta, aunque este proyecto no ha probado directamente ninguna de las dos configuraciones en Firefox. En Chromium se recomienda la extensión del navegador; si necesitas un userscript, utiliza Tampermonkey Beta. La versión estable de Tampermonkey y FireMonkey no pueden acceder a las cookies HttpOnly objetivo.

Si encuentras algún problema, comunícalo a través de [GitHub Issues](https://github.com/ilsd7/chatgpt-http-error-431-fixer/issues).

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
