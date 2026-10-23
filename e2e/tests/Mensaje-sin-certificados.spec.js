test('should show a message when the document has no certificates', async ({ page }) => {
  await page.goto('/certificados');

  await page.getByRole('combobox').selectOption({ label: 'CC' });
  await page.getByPlaceholder('Ej: 1234567890').fill('1000000000');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  await expect(page.getByText('No se encontraron certificados para ese documento.')).toBeVisible();
});