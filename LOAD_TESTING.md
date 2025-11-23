# Manual de Teste de Carga (Nginx + k6)

Este guia explica como executar testes de estresse no cluster Kubernetes local usando o script `load-test.js` e o **k6** via Docker.

## Pré-requisitos

*   **Docker** instalado e rodando.
*   Cluster **K3s** ativo.
*   Aplicação Nginx com **HPA** (Horizontal Pod Autoscaler) configurado.

## Como Executar o Teste

Não é necessário instalar o k6 na sua máquina. Rodamos ele em um container efêmero que monta o diretório atual.

Abra o terminal na raiz do projeto e execute:

```bash
docker run --rm -i -v $PWD:/src grafana/k6 run /src/load-test.js
```

### Monitorando o Cluster (Em outro terminal)

Enquanto o teste roda, é essencial ver o HPA reagindo e criando novos pods. Use este comando para acompanhar em tempo real:

```bash
watch -n 1 "kubectl get hpa && echo '---' && kubectl get pods | grep Running | wc -l"
```

## O Cenário de Teste

O script `load-test.js` executa uma estratégia de **Rampa de Estresse** com duração total de **7 minutos e 30 segundos**:

| Fase | Duração | RPS Alvo | Objetivo |
| :--- | :--- | :--- | :--- |
| **Aquecimento** | 30s | 100 → 500 | Validar conectividade básica. |
| **Carga** | 1m | 500 → 2000 | Forçar o uso de CPU e acordar o HPA. |
| **Estresse** | 2m | 2000 → 4000 | Testar o limite máximo de escalabilidade. |
| **Sustentação** | 3m | 4000 (Fixo) | Verificar estabilidade sob pressão constante. |
| **Resfriamento** | 1m | 4000 → 0 | Encerrar o teste suavemente. |

> **Nota:** O limite atual de estabilidade deste hardware é ~4000 RPS. Acima disso, a latência degrada severamente.

## Personalização

Para alterar a intensidade do teste, edite o arquivo `load-test.js` e modifique os valores de `target` no array `stages`:

```javascript
      stages: [
        { target: 500, duration: '30s' },  // Aumente ou diminua aqui
        { target: 2000, duration: '1m' },
        ...
      ],
```

Se alterar os targets, lembre-se de atualizar também os textos na constante `stageConfigs` para que os logs no console reflitam a realidade.
