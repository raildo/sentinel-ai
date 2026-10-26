# Política de segurança

## Como reportar uma vulnerabilidade

Não abra uma issue pública. Use o relato privado do GitHub: aba **Security** do repositório, depois **Report a vulnerability**.

Inclua, se possível:
- descrição do problema e do impacto;
- passos para reproduzir;
- versão ou commit afetado.

Respondemos o relato em até 5 dias úteis.

## Prazos de correção

Os prazos contam a partir da confirmação da vulnerabilidade e seguem a seção 4.2 do documento da Fase 4.

| Severidade | Prazo |
|---|---|
| Crítica | 7 dias |
| Alta | 30 dias |
| Média | 90 dias |

Severidade baixa é tratada junto da manutenção regular de dependências.

## Controles automatizados

Todo PR para a `main` passa pelo workflow de CI (`.github/workflows/ci.yml`):

- `npm audit` e dependency review para vulnerabilidades em dependências;
- gitleaks para segredos, incluindo o histórico;
- CodeQL para análise estática;
- geração de SBOM em CycloneDX.

O Dependabot abre PRs semanais para dependências npm e para as actions do workflow.
