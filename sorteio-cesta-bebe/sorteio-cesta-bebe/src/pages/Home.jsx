import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import { useSite } from '../lib/site.jsx';

const SLIDES = [
  { src: '/media/botinhas.webp', label: 'Feito com carinho', title: 'Pequenos detalhes, muito amor', text: 'Uma surpresa especial para acompanhar essa nova fase.' },
  { src: '/media/mao-bebe.webp', label: 'Um novo começo', title: 'O melhor presente é o cuidado', text: 'Participação gratuita, com número exclusivo e apuração transparente.' },
  { src: '/media/enxoval.webp', label: 'Momento especial', title: 'Aconchego em cada detalhe', text: 'Conheça os detalhes da cesta preparada para a futura mamãe.' },
];

function Carousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const timer = setInterval(() => setActive((n) => (n + 1) % SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, [paused]);
  const prev = () => setActive((n) => (n + SLIDES.length - 1) % SLIDES.length);
  const next = () => setActive((n) => (n + 1) % SLIDES.length);
  return (
    <section className="story-carousel-wrap" aria-label="Destaques do sorteio" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
      <div className="wrap story-carousel">
        <button type="button" className="story-arrow" onClick={prev} aria-label="Slide anterior">‹</button>
        <div className="story-viewport" aria-roledescription="carrossel">
          <div className="story-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {SLIDES.map((slide, i) => (
              <article key={slide.title} className="story-slide" aria-hidden={i !== active}>
                <img src={slide.src} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
                <div className="story-info"><span>{slide.label}</span><h3>{slide.title}</h3><p>{slide.text}</p></div>
              </article>
            ))}
          </div>
        </div>
        <button type="button" className="story-arrow" onClick={next} aria-label="Próximo slide">›</button>
      </div>
      <div className="story-dots" aria-label="Selecionar destaque">
        {SLIDES.map((slide, i) => <button key={slide.title} type="button" aria-label={`Ver destaque ${i + 1}`} aria-current={i === active ? 'true' : undefined} className={i === active ? 'active' : ''} onClick={() => setActive(i)} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { status, settings } = useSite();
  const headline = status?.title && status.title !== 'SORTEIO de prêmios para o seu bebê.' ? status.title : 'Um carinho especial para mamães e futuros bebês.';
  const firstImage = status?.prize_image_url || settings.prize_image_url || '/media/cesta-maternidade.webp';
  const basketTitle = status?.prize_title || 'Cesta Bebê Completa';
  const basketDescription = status?.prize_description || 'Uma cesta preparada com carinho para acompanhar os primeiros cuidados com o bebê.';
  return (
    <SiteChrome>
      <section className="new-hero" id="inicio">
        <div className="wrap new-hero-grid">
          <div className="new-hero-portrait"><img src="/media/gestante.webp" alt="Gestante acariciando a barriga em um ambiente acolhedor" fetchPriority="high" /></div>
          <div className="new-hero-content">
            <span className="eyebrow"><span aria-hidden="true">♡</span> Especial para gestantes</span>
            <h1>{headline}</h1>
            <p>{status?.subtitle || 'Participe gratuitamente, receba seu número na hora e concorra a uma cesta preparada para essa nova fase.'}</p>
            <div className="new-hero-actions"><a className="btn btn-lg" href="#form-card">Quero participar agora <span aria-hidden="true">→</span></a><a className="btn btn-ghost btn-lg" href="#premios">Conhecer a cesta</a></div>
            <div className="new-hero-trust"><span>✓ Inscrição gratuita</span><span>♡ Para gestantes</span><span>✧ Resultado público</span></div>
          </div>
          <div className="new-hero-gift"><img src={firstImage} alt="Ilustração dos presentes da campanha" fetchPriority="high" /><span className="gift-sticker">Um gesto de carinho ♡</span></div>
        </div>
      </section>

      <Carousel />

      <section id="premios" className="new-prizes band">
        <div className="wrap">
          <div className="new-section-heading">
            <span className="eyebrow">Um único prêmio</span>
            <h2>Uma cesta especial para uma futura mamãe</h2>
            <p>Um único sorteio, um único número vencedor e uma cesta como prêmio.</p>
          </div>
          <article className="single-basket-card">
            <div className="single-basket-photo">
              <img src={firstImage} alt={`Imagem ilustrativa: ${basketTitle}`} loading="lazy" />
            </div>
            <div className="single-basket-body">
              <span className="eyebrow">A cesta do sorteio</span>
              <h3>{basketTitle}</h3>
              <p>{basketDescription}</p>
              <a className="btn" href="#form-card">Quero participar</a>
              <p className="single-basket-note">Imagem ilustrativa. Consulte o regulamento para conferir o prêmio e as condições de participação.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="new-how band" id="como-funciona">
        <div className="wrap">
          <div className="new-section-heading"><span className="eyebrow">Simples e gratuito</span><h2>Como funciona?</h2><p>Três passos para participar dessa surpresa.</p></div>
          <div className="new-how-grid">
            <div className="new-step"><span className="new-step-icon">01</span><div><h3>Preencha seu cadastro</h3><p>Conte um pouquinho sobre você no formulário seguro.</p></div></div>
            <div className="new-step"><span className="new-step-icon">02</span><div><h3>Receba seu número</h3><p>Seu número e protocolo são gerados na hora. Guarde-os com carinho.</p></div></div>
            <div className="new-step"><span className="new-step-icon">03</span><div><h3>Acompanhe o resultado</h3><p>Consulte o único número vencedor na página de resultados.</p></div></div>
          </div>
        </div>
      </section>

      <section className="new-invite band" id="participar"><div className="wrap new-invite-grid">
        <div className="new-invite-copy"><span className="eyebrow">Sua jornada merece carinho</span><h2>Preparada para participar?</h2><p>Reserve seu número gratuitamente e acompanhe tudo com tranquilidade. Estamos torcendo por você!</p><img src="/media/mao-bebe.webp" alt="Mão delicada segurando a mão de um recém-nascido" loading="lazy" /><div className="new-invite-points"><span>✓ Sem compra</span><span>✓ Cadastro individual</span><span>✓ Consulta por protocolo</span></div><div className="home-legal-links"><Link to="/resultado#regulamento" className="subtle-link">Leia o regulamento completo →</Link><Link to="/privacidade" className="subtle-link">Termos de uso e privacidade →</Link></div></div>
        <RegistrationForm />
      </div></section>
    </SiteChrome>
  );
}
