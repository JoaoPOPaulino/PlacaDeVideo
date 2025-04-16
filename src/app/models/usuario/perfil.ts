export enum Perfil {
  USER,
  ADMIN,
  
}

export namespace Perfil {
  export function fromValue(value: string | number): Perfil {
    const strValue = String(value).toUpperCase();

    switch (strValue) {
      case '1':
      case 'USER':
        return Perfil.USER;
      case '2':
      case 'ADMIN':
        return Perfil.ADMIN;
      default:
        console.warn('Valor de perfil inválido:', value);
        return Perfil.USER;
    }
  }

  export function toId(perfil: Perfil): number {
    switch (perfil) {
      case Perfil.USER:
        return 1;
      case Perfil.ADMIN:
        return 2;
      default:
        return 1;
    }
  }
}

export function getCategoriaLabel(perfil: Perfil): string {
  switch (perfil) {
    case Perfil.USER:
      return 'User';
    case Perfil.ADMIN:
      return 'Admin';
    default:
      return 'Desconhecida';
  }
}

