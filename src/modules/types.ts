import React from 'react';
import { Permissao } from '../services/rbac';

export type GrupoModulo = 'principal' | 'operacao' | 'gestao' | 'seguranca';

export interface AcaoRapida {
  id: string;
  rotulo: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subTab?: string;
  permissao?: Permissao;
}

export interface PendenciaItem {
  id: string;
  titulo: string;
  descricao: string;
  moduloId: string;
  subTab?: string;
  urgencia: 'alta' | 'media' | 'baixa';
  acaoRotulo: string;
}

export interface ResumoHomeItem {
  valor: string | number;
  rotulo: string;
  badge?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
}

export interface ModuleManifest {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  grupo: GrupoModulo;
  permissaoMinima: Permissao;
  badge?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  acoesRapidas?: AcaoRapida[];
  resumoHome: (context: any) => ResumoHomeItem;
  pendencias?: (context: any) => PendenciaItem[];
  ajudaContextual?: {
    titulo: string;
    tarefas: Array<{ titulo: string; descricao: string }>;
  };
}
