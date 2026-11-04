
# Contrato da API (MVP - Otimização de Rotas)

Este documento define o formato de comunicação (JSON) entre o Frontend e o Backend para a rota de cálculo.

## Endpoint: POST /calcular-rota

### 1. O que o Frontend envia para o Backend (Request)

O Frontend deve enviar a lista de destinos contendo um ID e o endereço em texto.

**Exemplo de JSON de Entrada:**
```json
{
  "destinos": [
    {
      "id": 1,
      "endereco": "Av. Paulista, 1000 - São Paulo"
    },
    {
      "id": 2,
      "endereco": "Rua Augusta, 500 - São Paulo"
    }
  ]
}