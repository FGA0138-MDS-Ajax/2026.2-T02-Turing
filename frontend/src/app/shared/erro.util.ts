import { HttpErrorResponse } from '@angular/common/http';

// transforma o erro do http em uma mensagem que o usuário entende.
// o fastapi manda o motivo em erro.error.detail (string) quando é um HTTPException;
// em erro de validação (422) o detail é uma lista, então cai na mensagem padrão.
export function mensagemDeErro(erro: unknown, padrao: string): string {
  const resposta = erro as HttpErrorResponse;

  if (resposta?.status === 0) {
    return 'Não foi possível falar com o servidor. Confira se a API está rodando e tente de novo.';
  }

  const detalhe = resposta?.error?.detail;
  if (typeof detalhe === 'string') {
    return detalhe;
  }

  return padrao;
}