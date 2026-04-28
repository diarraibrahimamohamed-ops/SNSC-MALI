import { test, expect } from '@playwright/test';

test.describe('Relances SMS', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'agent@vaccin-track.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    
    // Attendre la redirection vers le dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('devrait afficher la liste des relances SMS', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.click('[data-testid=relances-menu]');
    await expect(page).toHaveURL('/relances');
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('[data-testid=page-title]')).toContainText('Relances SMS');
    
    // Vérifier que la liste des relances est visible
    await expect(page.locator('[data-testid=relances-list]')).toBeVisible();
    
    // Vérifier les colonnes du tableau
    await expect(page.locator('[data-testid=col-enfant]')).toBeVisible();
    await expect(page.locator('[data-testid=col-telephone]')).toBeVisible();
    await expect(page.locator('[data-testid=col-message]')).toBeVisible();
    await expect(page.locator('[data-testid=col-statut]')).toBeVisible();
    await expect(page.locator('[data-testid=col-date]')).toBeVisible();
  });

  test('devrait permettre de déclencher des relances manuelles', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Cliquer sur le bouton pour déclencher des relances
    await page.click('[data-testid=declencher-relances-btn]');
    
    // Vérifier que la modal s'ouvre
    await expect(page.locator('[data-testid=relances-modal]')).toBeVisible();
    
    // Sélectionner des enfants pour les relances
    await page.check('[data-testid=enfant-checkbox]:first-child');
    await page.check('[data-testid=enfant-checkbox]:nth-child(2)');
    
    // Confirmer le déclenchement
    await page.click('[data-testid=confirmer-relances-btn]');
    
    // Vérifier le message de succès
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=success-message]')).toContainText('Relances déclenchées avec succès');
    
    // Vérifier que la modal se ferme
    await expect(page.locator('[data-testid=relances-modal]')).not.toBeVisible();
  });

  test('devrait permettre de filtrer les relances par statut', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Filtrer par statut "envoyé"
    await page.selectOption('[data-testid=statut-filter]', 'envoyé');
    
    // Vérifier que le filtre est appliqué
    await expect(page.locator('[data-testid=statut-filter]')).toHaveValue('envoyé');
    
    // Vérifier que seules les relances envoyées sont affichées
    const relances = page.locator('[data-testid=relance-item]');
    const count = await relances.count();
    
    for (let i = 0; i < count; i++) {
      const statut = await relances.nth(i).locator('[data-testid=relance-statut]').textContent();
      expect(statut).toBe('envoyé');
    }
  });

  test('devrait permettre de rechercher des relances', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Rechercher un enfant spécifique
    await page.fill('[data-testid=search-input]', 'Doe');
    
    // Vérifier que la recherche est appliquée
    await expect(page.locator('[data-testid=search-input]')).toHaveValue('Doe');
    
    // Vérifier que les résultats correspondent à la recherche
    const relances = page.locator('[data-testid=relance-item]');
    const count = await relances.count();
    
    if (count > 0) {
      const firstResult = await relances.first().locator('[data-testid=relance-enfant]').textContent();
      expect(firstResult).toContain('Doe');
    }
  });

  test('devrait afficher les détails d\'une relance', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Cliquer sur une relance pour voir les détails
    await page.click('[data-testid=relance-item]:first-child');
    
    // Vérifier que la page de détails s'ouvre
    await expect(page.locator('[data-testid=relance-details]')).toBeVisible();
    
    // Vérifier les informations détaillées
    await expect(page.locator('[data-testid=enfant-info]')).toBeVisible();
    await expect(page.locator('[data-testid=message-content]')).toBeVisible();
    await expect(page.locator('[data-testid=envoi-details]')).toBeVisible();
    
    // Vérifier le bouton pour renvoyer la relance
    await expect(page.locator('[data-testid=renvoyer-btn]')).toBeVisible();
  });

  test('devrait permettre de renvoyer une relance', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Cliquer sur une relance échouée
    await page.click('[data-testid=relance-echouee]:first-child');
    
    // Cliquer sur le bouton pour renvoyer
    await page.click('[data-testid=renvoyer-btn]');
    
    // Confirmer le renvoi
    await page.click('[data-testid=confirmer-renvoi-btn]');
    
    // Vérifier le message de succès
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=success-message]')).toContainText('Relance renvoyée avec succès');
  });

  test('devrait afficher les statistiques des relances', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Vérifier que les statistiques sont affichées
    await expect(page.locator('[data-testid=stats-total]')).toBeVisible();
    await expect(page.locator('[data-testid=stats-envoyes]')).toBeVisible();
    await expect(page.locator('[data-testid=stats-en-attente]')).toBeVisible();
    await expect(page.locator('[data-testid=stats-echoues]')).toBeVisible();
    
    // Vérifier que les chiffres sont des nombres
    const totalText = await page.locator('[data-testid=stats-total]').textContent();
    expect(parseInt(totalText || '0')).toBeGreaterThanOrEqual(0);
  });

  test('devrait permettre d\'exporter les relances', async ({ page }) => {
    // Naviguer vers la page des relances
    await page.goto('/relances');
    
    // Cliquer sur le bouton d'export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid=export-btn]');
    
    // Vérifier que le téléchargement commence
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/);
  });
});
