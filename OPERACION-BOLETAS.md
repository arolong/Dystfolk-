# Operacion Manual de Boletas (WhatsApp)

Este proyecto usa backend minimo para leer configuracion de boletas.
No hay reservas automaticas ni pasarela.

## Variables en Netlify

Configura estas variables en Netlify (Site settings -> Environment variables):

- PREVENTA_PRICE: precio preventa. Ejemplo `15000`
- PREVENTA_STOCK: cupos preventa. Ejemplo `20` o `25`
- PREVENTA_ACTIVE: activa/inactiva preventa (`true` o `false`)
- GENERAL_PRICE: precio general. Ejemplo `20000`
- GENERAL_STOCK: cupos general
- GENERAL_ACTIVE: activa/inactiva general (`true` o `false`)

## Flujo durante venta

1. Iniciar evento:
- PREVENTA_ACTIVE=true
- PREVENTA_STOCK=20 (o 25)
- Redeploy

2. Cuando preventa se agote:
- Opcion A: PREVENTA_STOCK=0
- Opcion B: PREVENTA_ACTIVE=false
- Redeploy

3. Si necesitas reabrir preventa:
- PREVENTA_ACTIVE=true
- PREVENTA_STOCK=<nuevo valor>
- Redeploy

## Verificacion rapida despues de cada cambio

1. Abrir la web y entrar a Boletas.
2. Verificar precio preventa visible.
3. Si esta agotada, confirmar que el boton dice "Preventa agotada" y esta deshabilitado.
4. Si esta activa, confirmar que el boton dice "Agregar al carrito".

## Desarrollo local

- Si el puerto 5173 esta ocupado, usar:

```bash
npm run dev:5174
```

- Abrir `http://localhost:5174/`.
