# Nginx K3s Project

Projeto de demonstração de um servidor Nginx rodando em Kubernetes (K3s) com escalonamento automático (HPA) e injeção dinâmica de hostname.

## Funcionalidades

*   Página estática leve servida por Nginx.
*   Exibição do hostname do Pod que processou a requisição (injetado via script de inicialização).
*   Configuração de HPA (Horizontal Pod Autoscaler) baseada em CPU.
*   Setup de testes de carga com k6.

## Pré-requisitos

*   Docker
*   Kubernetes (K3s recomendado)
*   kubectl configurado

## Como Usar

1.  Aplique os manifestos no cluster:

    ```bash
    kubectl apply -f k3s/manifest.yaml
    ```

2.  Acesse a aplicação (configurada via Ingress):

    URL: http://nginx.dellabeneta.io

## Exposição Externa

Este projeto utiliza o Cloudflared para expor o servidor doméstico para a internet. Caso queira expor sua própria instância, você pode seguir com o Cloudflared ou configurar o Ingress com qualquer domínio público de sua preferência.

## Estrutura do Projeto

*   `html/`: Código fonte da página web.
*   `k3s/`: Manifestos Kubernetes (Deployment, Service, Ingress, HPA).
*   `Dockerfile`: Definição da imagem do container com script de injeção de variáveis.
*   `load-test.js`: Script de teste de carga k6.

## Testes de Carga

Para validar o autoscaling e a performance do cluster, consulte o manual dedicado:

[LOAD_TESTING.md](./LOAD_TESTING.md)
