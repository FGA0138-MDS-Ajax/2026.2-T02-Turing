export function validarNomeUsuario(nome: string | undefined): string | null {
    if (nome === undefined || !nome.trim()) {
        return 'Digite um nome.';
    }
    if (nome.trim().length < 4) {
        return 'Nome deve conter ao menos 4 caracteres.';
    }
    return null;
}

export function validarEmailUsuario(email: string | undefined): string | null {
    if (email === undefined || !email.trim()) {
        return 'Digite um e-mail.';
    }
    if (!/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.([a-z]+))?$/i.test(email.valueOf())) {
        return 'Email deve seguir o formato: "fulano@gmail.com".'
    }
    return null;
}

export function validarSenhaUsuario(senha: string | undefined): string | null {
    if (senha === undefined || !senha.trim()) {
        return 'Digite uma senha.';
    }
    if (senha.trim().length < 8) {
        return 'Senha deve ter ao menos 8 caracteres.';
    }
    return null;
}

export function validarTelefoneUsuario(telefone: string | undefined | null): string | null {
    const valorTelefone = limpaCampoTelefoneUsuario(telefone)
    if (valorTelefone === null) {
        return null;
    }
    if (!/^\([1-9]{2}\)\s9?\d{4}-?\d{4}$/.test(valorTelefone)) {
        return 'Telefone deve seguir o formato: "(61) 99876-5432".';
    }
    return null;
}

export function limpaCampoTelefoneUsuario(telefone: string | undefined | null): string | null {
    if (telefone === null || telefone === undefined || !telefone.trim()) {
        return null;
    }
    return telefone;
}

export function telefonesUsuarioIguais(telefone1: string | undefined | null, telefone2: string | undefined | null): boolean {
    console.log(telefone1, telefone2, limpaCampoTelefoneUsuario(telefone1), limpaCampoTelefoneUsuario(telefone2));
    return limpaCampoTelefoneUsuario(telefone1) === limpaCampoTelefoneUsuario(telefone2);
}