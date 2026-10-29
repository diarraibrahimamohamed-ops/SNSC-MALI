<?php

declare(strict_types=1);

/**
 * Generate a per-environment RSA key pair only when neither key exists.
 * Never commit generated files. Existing keys are preserved.
 */

$keyDirectory = dirname(__DIR__) . '/storage/jwt';
$privatePath = $keyDirectory . '/private.pem';
$publicPath = $keyDirectory . '/public.pem';

if (! is_dir($keyDirectory) && ! mkdir($keyDirectory, 0700, true) && ! is_dir($keyDirectory)) {
    throw new RuntimeException('Impossible de créer le répertoire des clés JWT.');
}

$hasPrivate = is_file($privatePath) && filesize($privatePath) > 0;
$hasPublic = is_file($publicPath) && filesize($publicPath) > 0;

if ($hasPrivate && $hasPublic) {
    chmod($privatePath, 0600);
    chmod($publicPath, 0644);
    fwrite(STDOUT, "Paire de clés JWT existante conservée.\n");
    exit(0);
}

if ($hasPrivate || $hasPublic) {
    throw new RuntimeException(
        'Paire JWT incomplète : fournir une paire cohérente ou supprimer les deux fichiers avant de régénérer.'
    );
}

$key = openssl_pkey_new([
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
    'private_key_bits' => 3072,
]);

if ($key === false) {
    throw new RuntimeException('La génération de la clé privée JWT a échoué.');
}

$privatePem = '';
if (! openssl_pkey_export($key, $privatePem)) {
    throw new RuntimeException('L’export de la clé privée JWT a échoué.');
}

$details = openssl_pkey_get_details($key);
$publicPem = $details['key'] ?? null;
if (! is_string($publicPem) || $publicPem === '') {
    throw new RuntimeException('L’export de la clé publique JWT a échoué.');
}

$suffix = bin2hex(random_bytes(8));
$privateTemp = $privatePath . '.tmp.' . $suffix;
$publicTemp = $publicPath . '.tmp.' . $suffix;

try {
    if (file_put_contents($privateTemp, $privatePem, LOCK_EX) === false) {
        throw new RuntimeException('Impossible d’écrire la clé privée JWT.');
    }
    chmod($privateTemp, 0600);

    if (file_put_contents($publicTemp, $publicPem, LOCK_EX) === false) {
        throw new RuntimeException('Impossible d’écrire la clé publique JWT.');
    }
    chmod($publicTemp, 0644);

    if (! rename($privateTemp, $privatePath) || ! rename($publicTemp, $publicPath)) {
        throw new RuntimeException('Impossible d’installer la paire de clés JWT.');
    }

    chmod($privatePath, 0600);
    chmod($publicPath, 0644);
    fwrite(STDOUT, "Nouvelle paire de clés JWT générée pour cet environnement.\n");
} finally {
    if (is_file($privateTemp)) {
        unlink($privateTemp);
    }
    if (is_file($publicTemp)) {
        unlink($publicTemp);
    }
}
