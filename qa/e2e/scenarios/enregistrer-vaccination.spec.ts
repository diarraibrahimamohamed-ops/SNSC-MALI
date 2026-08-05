import { test, expect } from '@playwright/test';

test.describe('Enregistrement d\'une vaccination', () => {
  let enfantId: string;

  test.beforeEach(async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'agent@vaccin-track.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    
    // Créer un enfant pour les tests
    await page.goto('/enfants/nouveau');
    await page.fill('[data-testid=nom-input]', 'Test');
    await page.fill('[data-testid=prenom-input]', 'Child');
    await page.fill('[data-testid=date-naissance-input]', '2022-01-01');
    await page.selectOption('[data-testid=sexe-select]', 'M');
    await page.fill('[data-testid=lieu-naissance-input]', 'Dakar');
    await page.selectOption('[data-testid=centre-select]', '1');
    
    await page.fill('[data-testid=tuteur-nom-input]', 'Parent');
    await page.fill('[data-testid=tuteur-prenom-input]', 'Test');
    await page.fill('[data-testid=tuteur-telephone-input]', '0123456789');
    await page.selectOption('[data-testid=tuteur-relation-select]', 'Mère');
    
    await page.click('[data-testid=enregistrer-btn]');
    
    // Récupérer l'ID de l'enfant depuis l'URL
    const url = page.url();
    enfantId = url.match(/\/enfants\/(\d+)/)?.[1] || '';
  });

  test('devrait permettre d\'enregistrer une vaccination', async ({ page }) => {
    // Naviguer vers la page de vaccination de l'enfant
    await page.goto(`/enfants/${enfantId}/vacciner`);
    
    // Vérifier que nous sommes sur la bonne page
    await expect(page.locator('[data-testid=page-title]')).toContainText('Enregistrer une vaccination');
    
    // Sélectionner un vaccin
    await page.selectOption('[data-testid=vaccin-select]', '1');
    
    // Remplir les détails de la vaccination
    await page.fill('[data-testid=date-vaccination-input]', '2024-01-15');
    await page.fill('[data-testid=dose-input]', '1');
    await page.fill('[data-testid=lot-vaccin-input]', 'LOT123456');
    
    // Soumettre le formulaire
    await page.click('[data-testid=enregistrer-vaccination-btn]');
    
    // Vérifier le message de succès
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=success-message]')).toContainText('Vaccination enregistrée avec succès');
    
    // Vérifier que nous sommes redirigés vers la page de l'enfant
    await expect(page).toHaveURL(`/enfants/${enfantId}`);
    
    // Vérifier que la vaccination apparaît dans l'historique
    await expect(page.locator('[data-testid=vaccinations-list]')).toBeVisible();
    await expect(page.locator('[data-testid=vaccination-item]')).toHaveCount.greaterThan(0);
  });

  test('devrait valider les champs obligatoires', async ({ page }) => {
    // Naviguer vers la page de vaccination
    await page.goto(`/enfants/${enfantId}/vacciner`);
    
    // Soumettre le formulaire vide
    await page.click('[data-testid=enregistrer-vaccination-btn]');
    
    // Vérifier les messages d'erreur
    await expect(page.locator('[data-testid=vaccin-error]')).toBeVisible();
    await expect(page.locator('[data-testid=date-vaccination-error]')).toBeVisible();
    await expect(page.locator('[data-testid=dose-error]')).toBeVisible();
  });

  test('devrait empêcher les doublons de vaccination', async ({ page }) => {
    // D'abord, enregistrer une vaccination
    await page.goto(`/enfants/${enfantId}/vacciner`);
    await page.selectOption('[data-testid=vaccin-select]', '1');
    await page.fill('[data-testid=date-vaccination-input]', '2024-01-15');
    await page.fill('[data-testid=dose-input]', '1');
    await page.click('[data-testid=enregistrer-vaccination-btn]');
    
    // Attendre la redirection
    await expect(page).toHaveURL(`/enfants/${enfantId}`);
    
    // Essayer d'enregistrer la même vaccination
    await page.goto(`/enfants/${enfantId}/vacciner`);
    await page.selectOption('[data-testid=vaccin-select]', '1');
    await page.fill('[data-testid=date-vaccination-input]', '2024-01-15');
    await page.fill('[data-testid=dose-input]', '1');
    await page.click('[data-testid=enregistrer-vaccination-btn]');
    
    // Vérifier le message d'erreur de doublon
    await expect(page.locator('[data-testid=error-message]')).toBeVisible();
    await expect(page.locator('[data-testid=error-message]')).toContainText('déjà enregistrée');
  });

  test('devrait afficher le calendrier vaccinal', async ({ page }) => {
    // Naviguer vers la page de vaccination
    await page.goto(`/enfants/${enfantId}/vacciner`);
    
    // Vérifier que le calendrier vaccinal est visible
    await expect(page.locator('[data-testid=calendrier-vaccinal]')).toBeVisible();
    
    // Vérifier que les vaccins recommandés sont affichés
    await expect(page.locator('[data-testid=vaccin-recommande]')).toHaveCount.greaterThan(0);
    
    // Cliquer sur un vaccin recommandé devrait pré-remplir le formulaire
    await page.click('[data-testid=vaccin-recommande]:first-child');
    await expect(page.locator('[data-testid=vaccin-select]')).toHaveValue(/./);
  });

  test('devrait gérer les effets secondaires', async ({ page }) => {
    // Naviguer vers la page de vaccination
    await page.goto(`/enfants/${enfantId}/vacciner`);
    
    // Remplir le formulaire
    await page.selectOption('[data-testid=vaccin-select]', '1');
    await page.fill('[data-testid=date-vaccination-input]', '2024-01-15');
    await page.fill('[data-testid=dose-input]', '1');
    
    // Ajouter des effets secondaires
    await page.fill('[data-testid=effets-secondaires-input]', 'Légère fièvre, rougeur au site d\'injection');
    
    // Soumettre le formulaire
    await page.click('[data-testid=enregistrer-vaccination-btn]');
    
    // Vérifier le succès
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    
    // Vérifier que les effets secondaires sont enregistrés
    await page.goto(`/enfants/${enfantId}`);
    await expect(page.locator('[data-testid=vaccination-item]')).toContainText('Effets secondaires');
  });
});
