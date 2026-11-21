export class ConsultaCertificadoPage {
  constructor(page) {
    this.page = page;
  }

  async abrir() {
    await this.page.goto('/certificados');
  }

  async llenar({ tipo = 'CC', numero }) {
    await this.page.getByLabel('Tipo de documento').selectOption({ label: tipo });
    await this.page.getByLabel('Número de documento').fill(numero);
  }

  async buscar(datos) {
    await this.llenar(datos);
    await this.page.getByRole('button', { name: 'Buscar certificados' }).click();
  }
}