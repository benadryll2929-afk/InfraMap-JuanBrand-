// Página pública: /terminos
// Colócala en src/pages/Terminos.jsx y regístrala en App.jsx FUERA de las rutas protegidas.

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

export default function Terminos() {
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
          <h1 className="text-white text-3xl font-bold">Condiciones del servicio</h1>
          <p className="text-zinc-400 text-sm">Última actualización: {ACTUALIZADO}</p>
          <p className="text-[15px] leading-7">
            Estas condiciones regulan el uso de InfraMap, la aplicación de la comunidad del IETI
            Rafael Navia Varón para reportar y dar seguimiento a daños en la infraestructura del
            colegio. Al crear una cuenta o usar la aplicación, aceptas estas condiciones.
          </p>
        </header>

        <Seccion titulo="1. Qué es InfraMap">
          <p>
            InfraMap permite a estudiantes, docentes y personal del colegio reportar daños,
            comentarlos, apoyar los reportes de otras personas y ver cuándo se resuelven. Los
            administradores del colegio revisan los reportes y los marcan como resueltos.
          </p>
        </Seccion>

        <Seccion titulo="2. Quién puede usarla">
          <Lista
            items={[
              "El registro está pensado para la comunidad del colegio y se hace con un correo institucional o con una cuenta autorizada por los administradores.",
              "Si eres menor de edad, usas la aplicación con la autorización del colegio y de tus padres o acudientes.",
              "Debes darnos datos verdaderos al registrarte.",
            ]}
          />
        </Seccion>

        <Seccion titulo="3. Tu cuenta">
          <p>
            Eres responsable de lo que se haga con tu cuenta. Guarda tu contraseña y no la compartas.
            Si crees que alguien más entró a tu cuenta, cambia tu contraseña y avísanos por el correo
            de contacto.
          </p>
        </Seccion>

        <Seccion titulo="4. Cómo usar la aplicación">
          <p>Al usar InfraMap te comprometes a:</p>
          <Lista
            items={[
              "Reportar daños reales, con una descripción clara y una ubicación correcta.",
              "Tratar con respeto a las demás personas en los comentarios.",
              "No subir fotos donde aparezcan personas, ni información personal o privada de otros.",
              "No publicar contenido ofensivo, discriminatorio, violento, sexual o ilegal.",
              "No crear reportes falsos ni repetidos a propósito, ni intentar engañar al sistema de apoyos.",
              "No intentar acceder a cuentas o datos que no te corresponden, ni dañar el funcionamiento de la aplicación.",
            ]}
          />
        </Seccion>

        <Seccion titulo="5. Lo que publicas">
          <p>
            Los reportes, fotos y comentarios que publicas siguen siendo tuyos. Al publicarlos nos
            autorizas a mostrarlos dentro de InfraMap a la comunidad del colegio y a los
            administradores, con el fin de gestionar y resolver los daños.
          </p>
        </Seccion>

        <Seccion titulo="6. Moderación">
          <p>
            Los administradores pueden editar, ocultar o eliminar reportes y comentarios que
            incumplan estas condiciones, y pueden suspender o eliminar cuentas cuando haya un uso
            indebido.
          </p>
        </Seccion>

        <Seccion titulo="7. InfraMap no es un canal de emergencias">
          <p>
            Si un daño representa un peligro inmediato para las personas (por ejemplo, cables
            expuestos, fugas de gas o estructuras a punto de caer), no esperes a que alguien lea tu
            reporte: avisa de inmediato a un docente, directivo o personal del colegio.
          </p>
        </Seccion>

        <Seccion titulo="8. Tiempos de reparación">
          <p>
            Marcar un reporte con una gravedad alta o recibir apoyos no garantiza que se repare en un
            plazo determinado. Las reparaciones dependen de los recursos y decisiones del colegio.
          </p>
        </Seccion>

        <Seccion titulo="9. Disponibilidad del servicio">
          <p>
            Hacemos lo posible para que InfraMap funcione de manera estable, pero se ofrece tal como
            está. Puede haber interrupciones, errores o cambios, y podemos modificar o retirar
            funciones. No somos responsables por pérdidas derivadas de que la aplicación no esté
            disponible.
          </p>
        </Seccion>

        <Seccion titulo="10. Privacidad">
          <p>
            El tratamiento de tus datos personales se explica en nuestra{" "}
            <a
              href="/privacidad"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              política de privacidad
            </a>
            .
          </p>
        </Seccion>

        <Seccion titulo="11. Terminar tu cuenta">
          <p>
            Puedes dejar de usar InfraMap cuando quieras y pedir la eliminación de tu cuenta
            escribiendo al correo de contacto. También podemos cerrar cuentas que incumplan estas
            condiciones.
          </p>
        </Seccion>

        <Seccion titulo="12. Cambios en estas condiciones">
          <p>
            Podemos actualizar estas condiciones. Publicaremos la nueva versión en esta página con su
            fecha. Si sigues usando la aplicación después del cambio, entendemos que la aceptas.
          </p>
        </Seccion>

        <Seccion titulo="13. Ley aplicable">
          <p>Estas condiciones se rigen por las leyes de la República de Colombia.</p>
        </Seccion>

        <Seccion titulo="14. Contacto">
          <p>
            Para preguntas sobre estas condiciones, escríbenos a{" "}
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
