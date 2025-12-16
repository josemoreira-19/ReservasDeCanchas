<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reserva de Canchas - Inicio</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; }
        h1 { color: #2d3748; }
    </style>
</head>
<body>
    <h1>Bienvenido al Sistema de Canchas</h1>
    <p>Aquí podrás reservar canchas de fútbol, vóley y más.</p>
    
    <a href="{{ route('login') }}">Iniciar Sesión</a>
    <a href="{{ route('register') }}">Registrarse</a>
</body>
</html>