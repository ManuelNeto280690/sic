<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ConfiguracaoSistema extends Model
{
    protected $table = 'configuracoes_sistema';

    protected $fillable = [
        'chave',
        'valor',
        'grupo',
        'descricao',
    ];

    public static function getValor(string $chave, ?string $default = null): ?string
    {
        $config = static::where('chave', $chave)->first();
        return $config ? $config->valor : $default;
    }

    public static function setValor(string $chave, ?string $valor, string $grupo = 'geral', ?string $descricao = null): self
    {
        return static::updateOrCreate(
            ['chave' => $chave],
            [
                'valor' => $valor,
                'grupo' => $grupo,
                'descricao' => $descricao,
            ]
        );
    }

    /**
     * Retorna o URL público do logótipo institucional.
     */
    public static function getLogoUrl(): ?string
    {
        return static::getValor('logo_emblema_url');
    }

    /**
     * Retorna o logótipo oficial em formato Data URI Base64 para incorporação imediata em PDFs do DomPDF.
     */
    public static function getLogoBase64(): ?string
    {
        $url = static::getValor('logo_emblema_url');
        if (!$url) {
            return null;
        }

        // Tenta resolver caminho local a partir de /storage/
        $fullPath = null;
        if (Str::startsWith($url, '/storage/')) {
            $relativePath = Str::after($url, '/storage/');
            $candidate = storage_path('app/public/' . $relativePath);
            if (file_exists($candidate)) {
                $fullPath = $candidate;
            }
        }

        if (!$fullPath) {
            $candidate = public_path(ltrim($url, '/'));
            if (file_exists($candidate)) {
                $fullPath = $candidate;
            }
        }

        if ($fullPath && file_exists($fullPath)) {
            $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            $mime = match ($extension) {
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'svg' => 'image/svg+xml',
                'webp' => 'image/webp',
                default => mime_content_type($fullPath) ?: 'image/png',
            };

            $data = file_get_contents($fullPath);
            return 'data:' . $mime . ';base64,' . base64_encode($data);
        }

        return null;
    }
}
