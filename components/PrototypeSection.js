import ScrollReveal from "./ScrollReveal";

export default function PrototypeSection() {
  return (
    <ScrollReveal as="section" className="prototype">
      <figure className="prototype__photo">
        <img src="/assets/maquette.jpg" alt="Maquette physique du prototype ParkSens, vue de dessus" />
        <figcaption>Le prototype ParkSens, FabLab de la faculté</figcaption>
      </figure>
      <div className="prototype__text">
        <p className="prototype__eyebrow">De la maquette au cahier des charges</p>
        <h2 className="prototype__title">Une preuve de concept avant le déploiement</h2>
        <p className="prototype__body">
          Six places, deux barrières pilotées par servomoteur, un écran d&apos;affichage, des capteurs de
          présence et une toiture photovoltaïque : le prototype physique a permis de valider les
          mécanismes de base avant d&apos;envisager une version à l&apos;échelle du parking réel de la
          faculté. La réservation en ligne ci-dessous pilote ce même prototype à six places.
        </p>
      </div>
    </ScrollReveal>
  );
}
