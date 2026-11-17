export class MisTrabajadoresPage {
  constructor(page) {
    this.page = page;
  }

  async abrir() {
    await this.page.goto('/empresa/trabajadores');
  }

  async llenar({ nombre, apellido = 'Prueba', documento }) {
    await this.page.getByLabel('Nombre').fill(nombre);
    await this.page.getByLabel('Apellido').fill(apellido);
    await this.page.getByLabel('Tipo de documento').selectOption({ label: 'CC' });
    await this.page.getByLabel('Número de documento').fill(documento);
  }

  async registrar(datos) {
    await this.llenar(datos);
    await this.page.getByRole('button', { name: 'Registrar trabajador' }).click();
  }
}