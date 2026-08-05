import { test, expect } from '@playwright/test';

test.describe('Enregistrement d\'un enfant', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'agent@vaccin-track.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    
    // Attendre la redirection vers le dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('devrait permettre d\'enregistrer un nouvel enfant', async ({ page }) => {
    // Naviguer vers la page des enfants
    await page.click('[data-testid=enfants-menu]');
    await expect(page).toHaveURL('/enfants');
    
    // Cliquer sur le bouton pour ajouter un enfant
    await page.click('[data-testid=ajouter-enfant-btn]');
    await expect(page).toHaveURL('/enfants/nouveau');
    
    // Remplir le formulaire
    await page.fill('[data-testid=nom-input]', 'Doe');
    await page.fill('[data-testid=prenom-input]', 'John');
    await page.fill('[data-testid=date-naissance-input]', '2022-01-01');
    await page.selectOption('[data-testid=sexe-select]', 'M');
    await page.fill('[data-testid=lieu-naissance-input]', 'Dakar');
    await page.selectOption('[data-testid=centre-select]', '1');
    
    // Ajouter un tuteur
    await page.fill('[data-testid=tuteur-nom-input]', 'Doe');
    await page.fill('[data-testid=tuteur-prenom-input]', 'Jane');
    await page.fill('[data-testid=tuteur-telephone-input]', '0123456789');
    await page.selectOption('[data-testid=tuteur-relation-select]', 'Mère');
    
    // Soumettre le formulaire
    await page.click('[data-testid=enregistrer-btn]');
    
    // Vérifier que l'enfant a été créé
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=success-message]')).toContainText('Enfant enregistré avec succès');
    
    // Vérifier la redirection vers la page de l'enfant
    await expect(page).toHaveURL(/\/enfants\/\d+/);
    
    // Vérifier que les informations sont correctement affichées
    await expect(page.locator('[data-testid=enfant-nom]')).toContainText('Doe John');
    await expect(page.locator('[data-testid=enfant-date-naissance]')).toContainText('2022-01-01');
    await expect(page.locator('[data-testid=enfant-sexe]')).toContainText('Masculin');
  });

  test('devrait afficher une erreur pour les données invalides', async ({ page }) => {
    // Naviguer vers la page d'ajout d'enfant
    await page.goto('/enfants/nouveau');
    
    // Soumettre le formulaire vide
    await page.click('[data-testid=enregistrer-btn]');
    
    // Vérifier les messages d'erreur
    await expect(page.locator('[data-testid=nom-error]')).toBeVisible();
    await expect(page.locator('[data-testid=prenom-error]')).toBeVisible();
    await expect(page.locator('[data-testid=date-naissance-error]')).toBeVisible();
    await expect(page.locator('[data-testid=sexe-error]')).toBeVisible();
    await expect(page.locator('[data-testid=centre-error]')).toBeVisible();
    
    // Vérifier que le formulaire n'a pas été soumis
    await expect(page).toHaveURL('/enfants/nouveau');
  });

  test('devrait vérifier la validité du numéro de téléphone du tuteur', async ({ page }) => {
    // Naviguer vers la page d'ajout d'enfant
    await page.goto('/enfants/nouveau');
    
    // Remplir le formulaire avec un numéro de téléphone invalide
    await page.fill('[data-testid=nom-input]', 'Doe');
    await page.fill('[data-testid=prenom-input]', 'John');
    await page.fill('[data-testid=date-naissance-input]', '2022-01-01');
    await page.selectOption('[data-testid=sexe-select]', 'M');
    await page.fill('[data-testid=lieu-naissance-input]', 'Dakar');
    await page.selectOption('[data-testid=centre-select]', '1');
    
    // Ajouter un tuteur avec un téléphone invalide
    await page.fill('[data-testid=tuteur-nom-input]', 'Doe');
    await page.fill('[data-testid=tuteur-prenom-input]', 'Jane');
    await page.fill('[data-testid=tuteur-telephone-input]', '123'); // Numéro invalide
    await page.selectOption('[data-testid=tuteur-relation-select]', 'Mère');
    
    // Soumettre le formulaire
    await page.click('[data-testid=enregistrer-btn]');
    
    // Vérifier l'erreur de téléphone
    await expect(page.locator('[data-testid=tuteur-telephone-error]')).toBeVisible();
    await expect(page.locator('[data-testid=tuteur-telephone-error]')).toContainText('numéro de téléphone invalide');
  });

  test('devrait permettre d\'ajouter plusieurs tuteurs', async ({ page }) => {
    // Naviguer vers la page d'ajout d'enfant
    await page.goto('/enfants/nouveau');
    
    // Remplir le formulaire de base
    await page.fill('[data-testid=nom-input]', 'Doe');
    await page.fill('[data-testid=prenom-input]', 'John');
    await page.fill('[data-testid=date-naissance-input]', '2022-01-01');
    await page.selectOption('[data-testid=sexe-select]', 'M');
    await page.fill('[data-testid=lieu-naissance-input]', 'Dakar');
    await page.selectOption('[data-testid=centre-select]', '1');
    
    // Ajouter le premier tuteur
    await page.fill('[data-testid=tuteur-nom-input]', 'Doe');
    await page.fill('[data-testid=tuteur-prenom-input]', 'Jane');
    await page.fill('[data-testid=tuteur-telephone-input]', '0123456789');
    await page.selectOption('[data-testid=tuteur-relation-select]', 'Mère');
    
    // Ajouter un deuxième tuteur
    await page.click('[data-testid=ajouter-tuteur-btn]');
    await page.fill('[data-testid=tuteur-nom-input]', 'nth=1', 'Smith');
    await page.fill('[data-testid=tuteur-prenom-input]', 'nth=1', 'John');
    await page.fill('[data-testid=tuteur-telephone-input]', 'nth=1', '0987654321');
    await page.selectOption('[data-testid=tuteur-relation-select]', 'nth=1', 'Père');
    
    // Soumettre le formulaire
    await page.click('[data-testid=enregistrer-btn]');
    
    // Vérifier que l'enfant a été créé
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    
    // Naviguer vers la page de l'enfant et vérifier les tuteurs
    await expect(page).toHaveURL(/\/enfants\/\d+/);
    await expect(page.locator('[data-testid=tuteurs-list]')).toHaveCount(2);
  });
});
