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
        // 1. Validar longitud inicial y que sean solo números
        if (strlen($value) !== 10 || !is_numeric($value)) {
            $fail('La cédula debe tener exactamente 10 dígitos numéricos.');
            return;
        }

        // 2. Validar código de provincia (dos primeros dígitos)
        // 01-24 son provincias, 30 es para extranjeros residentes
        $provincia = intval(substr($value, 0, 2));
        if ($provincia < 1 || ($provincia > 24 && $provincia !== 30)) {
            $fail('El código de provincia (dos primeros dígitos) no es válido.');
            return;
        }

        // 3. Validar tercer dígito (debe ser menor a 6 para personas naturales)
        $digito3 = intval($value[2]);
        if ($digito3 >= 6) {
            // Nota: Si quisieras aceptar RUCs de empresas, la lógica cambia aquí.
            // Para "Clientes Personas", esto es correcto.
            $fail('El tercer dígito de la cédula es inválido para una persona natural.');
            return;
        }

        // 4. Algoritmo Módulo 10 (Suma de verificadores)
        $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $suma = 0;

        for ($i = 0; $i < 9; $i++) {
            $digito = intval($value[$i]);
            $producto = $digito * $coeficientes[$i];

            if ($producto >= 10) {
                $producto -= 9;
            }
            $suma += $producto;
        }

        // 5. Calcular dígito verificador
        $decenaSuperior = ceil($suma / 10) * 10;
        $digitoVerificadorCalculado = $decenaSuperior - $suma;
        
        // Si el resultado es 10, el dígito es 0
        if ($digitoVerificadorCalculado == 10) {
            $digitoVerificadorCalculado = 0;
        }

        // 6. Comparar con el último dígito de la cédula
        $ultimoDigitoReal = intval($value[9]);

        if ($digitoVerificadorCalculado !== $ultimoDigitoReal) {
            $fail('El número de cédula no es válido (dígito verificador incorrecto).');
        }
    }
}