# Landing comercial de PowerPOS

Sitio estático independiente del sistema operativo. Contiene presentación comercial, pantallas reales con datos de demostración, preguntas frecuentes y contacto directo.

- WhatsApp: +57 302 693 1489 (se abre con mensaje preparado; no se envía automáticamente).
- Correo: powerpospionners@gmail.com.
- Editar contenido en `dist/index.html`, estilos en `dist/styles.css` e interacciones en `dist/app.js`.
- El logo oficial está en `dist/assets/logo-powerpos.png` y el favicon en `dist/assets/favicon-powerpos.png`; provienen de la imagen elegida por el propietario, conservada en `marketing/logo-powerpos-elegido-original.png` dentro del repositorio principal.
- No recoge datos mediante formulario, no incluye analítica ni promete envío de solicitudes.
- Las fuentes se solicitan a Google Fonts; hay alternativas locales de respaldo.
- El sitio está publicado con acceso público en Sites.
- Revisar disponibilidad, alcance y condiciones comerciales al finalizar el piloto. No se anuncian facturación electrónica ni cifras de clientes o resultados no verificadas.

## Subir junto al proyecto a GitHub

La carpeta landing forma parte del repositorio principal. Sus archivos dist son fuente estática y se incluyen mediante excepciones específicas en el .gitignore raíz. No ejecutar git init dentro de landing ni agregarla como submódulo. El historial anterior independiente se conserva localmente en backups/landing-git-20260917, excluido de Git.

Para futuras publicaciones en Sites que requieran repositorio independiente, usar un checkout separado de ese historial y copiar allí los cambios; no reintroducir un .git anidado en esta carpeta. El identificador de alojamiento permanece en .openai/hosting.json. Subir archivos a GitHub no cambia por sí solo la audiencia del sitio ni equivale a publicarlo en GitHub Pages.
