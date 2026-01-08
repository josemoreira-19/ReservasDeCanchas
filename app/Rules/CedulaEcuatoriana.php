<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CedulaEcuatoriana implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 0. Limpieza: Quitamos espacios al inicio o final por si copiaron mal
        $cedula = trim((string)$value);

        // 1. Validar longitud y que sean solo números
        if (strlen($cedula) !== 10 || !ctype_digit($cedula)) {
            $fail('La cédula debe tener 10 dígitos numéricos.');
            return;
        }

        // 2. Validar código de provincia (dos primeros dígitos)
        $provincia = intval(substr($cedula, 0, 2));
        if ($provincia < 1 || ($provincia > 24 && $provincia !== 30)) {
            $fail('El código de provincia no es válido.');
            return;
        }

        // 3. Validar tercer dígito (debe ser menor a 6 para personas naturales)
        // Nota: Si el 3er dígito es 6 o 9 son casos especiales (empresas/públicas), 
        // aquí asumimos validación estándar de ciudadano.
        $tercerDigito = intval($cedula[2]);
        if ($tercerDigito >= 6) {
            $fail('Esta cédula no corresponde a una persona natural.');
            return;
        }

        // 4. Algoritmo Módulo 10 (Sin decimales, método exacto)
        $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $suma = 0;

        for ($i = 0; $i < 9; $i++) {
            $valor = intval($cedula[$i]);
            $producto = $valor * $coeficientes[$i];

            if ($producto >= 10) {
                $producto -= 9;
            }
            $suma += $producto;
        }

        // Cálculo del dígito verificador usando Módulo
        $residuo = $suma % 10;
        $verificadorCalculado = $residuo === 0 ? 0 : 10 - $residuo;

        // 5. Comparar con el último dígito real
        $ultimoDigitoReal = intval($cedula[9]);

        if ($verificadorCalculado !== $ultimoDigitoReal) {
            $fail('El número de cédula no es válido.');
        }
    }
}