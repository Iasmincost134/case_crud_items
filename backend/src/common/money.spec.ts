import { calcularSubtotal, calcularTotal } from './money';

describe('money', () => {
  it('soma sem o erro clássico de ponto flutuante', () => {
    expect(0.1 * 3 + 0.2 * 3).not.toBe(0.9); // o problema em JS puro
    expect(
      calcularTotal([
        { precoUnitario: 0.1, quantidade: 3 },
        { precoUnitario: 0.2, quantidade: 3 },
      ]),
    ).toBe(0.9);
  });

  it('calcula subtotal', () => {
    expect(calcularSubtotal(19.99, 3)).toBe(59.97);
  });
});
