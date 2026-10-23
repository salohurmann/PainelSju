/**
 * Camada de dados do Painel SJU sobre o Supabase.
 * As telas usam estas funções; nenhuma tela fala com o banco diretamente.
 */
export * as sessao from './sessao';
export * as frota from './frota';
export * as chamados from './chamados';
export * as salas from './salas';
export * as diarias from './diarias';
export * as cense from './cense';
export * as ramais from './ramais';
export * as notificacoes from './notificacoes';
export * as auditoria from './auditoria';
export * as mesa from './mesa';
export * as admin from './admin';
export { ErroPainel, traduzirErro } from './erros';
export type * from './tipos';
