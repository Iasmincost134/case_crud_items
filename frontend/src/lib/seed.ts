import { placeholderImage } from './placeholder';
import type { Product } from './types';

const raw: Omit<Product, 'id' | 'imageUrl'>[] = [
  { name: 'Teclado mecânico compacto', category: 'Eletrônicos', price: 389.9, description: 'Layout 65%, switches táteis e conexão Bluetooth ou USB-C.' },
  { name: 'Fone de ouvido sem fio', category: 'Eletrônicos', price: 549, description: 'Cancelamento de ruído ativo e até 30 horas de bateria.' },
  { name: 'Monitor 27" QHD', category: 'Eletrônicos', price: 1799.9, description: 'Painel IPS de 75 Hz, ajuste de altura e entrada HDMI/DisplayPort.' },
  { name: 'Luminária de mesa articulada', category: 'Casa', price: 129.9, description: 'Braço de alumínio, três temperaturas de cor e dimmer por toque.' },
  { name: 'Jogo de panelas antiaderentes', category: 'Casa', price: 459, description: 'Cinco peças com revestimento cerâmico, compatível com indução.' },
  { name: 'Cadeira ergonômica', category: 'Casa', price: 1290, description: 'Encosto em tela, apoio lombar regulável e braços 3D.' },
  { name: 'Jaqueta corta-vento', category: 'Moda', price: 279.9, description: 'Tecido leve e repelente à água, com capuz embutido na gola.' },
  { name: 'Tênis de corrida leve', category: 'Esporte', price: 499.9, description: 'Entressola em espuma responsiva e cabedal respirável.' },
  { name: 'Tapete de yoga 6 mm', category: 'Esporte', price: 89.9, description: 'Superfície antiderrapante e alça para transporte.' },
  { name: 'Garrafa térmica 750 ml', category: 'Esporte', price: 99, description: 'Aço inox com dupla parede, mantém a bebida gelada por 24 h.' },
  { name: 'Romance: A Hora Azul', category: 'Livros', price: 54.9, description: 'Edição de bolso com 320 páginas e posfácio da autora.' },
  { name: 'Caderno de desenho A4', category: 'Outros', price: 36.5, description: 'Papel 120 g/m², 80 folhas e capa dura com costura aparente.' },
];

export const seedProducts = (): Product[] =>
  raw.map((p, i) => ({
    ...p,
    id: i + 1,
    imageUrl: placeholderImage(p.name, p.category),
  }));
