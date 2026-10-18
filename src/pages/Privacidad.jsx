// Página pública: /privacidad
// Colócala en src/pages/Privacidad.jsx y regístrala en App.jsx FUERA de las rutas protegidas.

const CONTACTO = "admininframap@gmail.com";
const ACTUALIZADO = "18 de octubre de 2026";

function Seccion({ titulo, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-white text-lg font-semibold">{titulo}</h2>
      <div className="space-y-3 text-zinc-300 text-[15px] leading-7">{children}</div>
    </section>
  );
}

function Lista({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-emerald-500">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
        <header className="space-y-3">
          <a
            href="/"
            className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300"
          >
            Volver a InfraMap
          </a>
          <h1 className="text-white text-3xl font-bold">Política de privacidad</h1>
          <p className="text-zinc-400 text-sm">Última actualización: {ACTUALIZADO}</p>
          <p className="text-[15px] leading-7">
            InfraMap es una aplicación de la comunidad del IETI Rafael Navia Varón para reportar y
            dar seguimiento a daños en la infraestructura del colegio. Esta política explica qué
            datos recogemos, para qué los usamos y cómo puedes controlarlos.
          </p>
        </header>

        <Seccion titulo="1. Qué datos recogemos">
          <Lista
            items={[
              "Datos de tu cuenta: nombre, correo electrónico y, si la agregas, tu foto de perfil. Si entras con Google, recibimos de Google tu nombre, correo y foto de perfil.",
              "Contenido que publicas: reportes (título, descripción, categoría, gravedad y fotos del daño), el lugar que marcas en el plano del colegio, comentarios y apoyos a otros reportes.",
              "Fotos de reparación y notas, cuando un administrador marca un reporte como resuelto.",
              "Notificaciones que se generan dentro de la aplicación sobre tus reportes.",
              "Datos técnicos mínimos para mantener tu sesión iniciada, guardados en tu navegador o dispositivo.",
            ]}
          />
          <p>
            La aplicación puede pedir acceso a la cámara o a la galería de tu dispositivo, solo
            cuando tú eliges adjuntar una foto.
          </p>
        </Seccion>

        <Seccion titulo="2. Para qué usamos tus datos">
          <Lista
            items={[
              "Crear tu cuenta y permitirte iniciar sesión.",
              "Mostrar, gestionar y resolver los reportes de infraestructura del colegio.",
              "Avisarte por correo electrónico y dentro de la aplicación cuando tu reporte cambie de estado, y enviarte los correos de confirmación o de restablecimiento de contraseña.",
              "Mantener la seguridad del servicio y evitar usos indebidos.",
            ]}
          />
          <p>No vendemos tus datos ni los usamos para publicidad.</p>
        </Seccion>

        <Seccion titulo="3. Quién puede ver tu información">
          <p>
            Los reportes, comentarios y apoyos son visibles para las personas que tienen una cuenta
            en InfraMap, y tu nombre puede aparecer junto a lo que publicas. Los administradores del
            colegio pueden ver los reportes y los datos de quien los creó, para poder gestionarlos y
            avisarle cuando se resuelvan.
          </p>
          <p>
            Las fotos que subes se almacenan en un servicio de almacenamiento y pueden ser visibles
            para los usuarios de la aplicación. Evita incluir en las fotos a otras personas o
            información personal.
          </p>
        </Seccion>

        <Seccion titulo="4. Servicios de terceros">
          <p>Para funcionar, InfraMap usa estos proveedores, que procesan datos en nuestro nombre:</p>
          <Lista
            items={[
              "Supabase: base de datos, autenticación y almacenamiento de fotos.",
              "Vercel: alojamiento de la aplicación web.",
              "Brevo: envío de correos electrónicos.",
              "Google: inicio de sesión con tu cuenta de Google, si eliges esa opción.",
            ]}
          />
          <p>
            Estos servicios pueden almacenar datos en servidores fuera de Colombia y se rigen por sus
            propias políticas de privacidad.
          </p>
        </Seccion>

        <Seccion titulo="5. Acceso restringido">
          <p>
            El registro está limitado a correos institucionales del colegio y a cuentas autorizadas
            por los administradores de la aplicación.
          </p>
        </Seccion>

        <Seccion titulo="6. Menores de edad">
          <p>
            Parte de la comunidad del colegio son menores de edad. El uso de InfraMap por parte de
            menores se hace bajo la autorización del colegio y de sus padres o acudientes. Solo
            recogemos los datos necesarios para que la aplicación funcione y no los usamos con fines
            comerciales.
          </p>
        </Seccion>

        <Seccion titulo="7. Cuánto tiempo guardamos tus datos">
          <p>
            Guardamos tus datos mientras tu cuenta esté activa o sean necesarios para el
            funcionamiento de la aplicación. Si solicitas la eliminación de tu cuenta, borraremos tus
            datos personales, salvo los que debamos conservar por una obligación legal.
          </p>
        </Seccion>

        <Seccion titulo="8. Tus derechos">
          <p>
            De acuerdo con la Ley 1581 de 2012 de Colombia sobre protección de datos personales,
            puedes:
          </p>
          <Lista
            items={[
              "Conocer, actualizar y rectificar tus datos.",
              "Pedir que eliminemos tu cuenta y tus datos.",
              "Revocar la autorización que nos diste para tratarlos.",
              "Presentar una consulta o reclamo sobre el manejo de tus datos.",
            ]}
          />
          <p>
            Para ejercer estos derechos, escríbenos a{" "}
            <a
              href={`mailto:${CONTACTO}`}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              {CONTACTO}
            </a>
            , indicando el correo con el que te registraste.
          </p>
        </Seccion>

        <Seccion titulo="9. Seguridad">
          <p>
            Aplicamos medidas técnicas para proteger tus datos, como conexiones cifradas y reglas de
            acceso que limitan quién puede leer y modificar la información. Ningún sistema es
            completamente seguro, por lo que te recomendamos usar una contraseña única y no
            compartirla.
          </p>
        </Seccion>

        <Seccion titulo="10. Cambios a esta política">
          <p>
            Si cambiamos esta política, publicaremos la nueva versión en esta misma página con la
            fecha de actualización.
          </p>
        </Seccion>

        <Seccion titulo="11. Contacto">
          <p>
            Si tienes preguntas sobre esta política o sobre tus datos, escríbenos a{" "}
            <a
              href={`mailto:${CONTACTO}`}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              {CONTACTO}
            </a>
            .
          </p>
        </Seccion>
      </div>
    </div>
  );
}
