import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  KpiStat,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  Modal,
  Drawer,
  Toast,
  Skeleton,
  EmptyState,
  Avatar,
  Switch
} from './index';
import { Search, Plus, Filter, Car, Shield, Download } from 'lucide-react';

export const UiKitCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState('botoes');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchVal, setSwitchVal] = useState(true);
  const [toastVisible, setToastVisible] = useState(true);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          Design System · Biblioteca de Componentes Base
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Padrão institucional SEJU / Governo do Estado do Paraná (gov.br + Linear style).
        </p>
      </div>

      <Tabs
        variant="segmented"
        activeId={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'botoes', label: 'Botões & Inputs' },
          { id: 'cards', label: 'Cards & KPIs' },
          { id: 'badges', label: 'Badges & Status' },
          { id: 'tabelas', label: 'Tabela & Skeleton' },
          { id: 'overlays', label: 'Modais & Drawers' }
        ]}
      />

      {activeTab === 'botoes' && (
        <div className="space-y-6">
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Botões (Variantes & Tamanhos)</CardTitle>
              <CardDescription>Padrões de 32px (sm), 36px (md) e 40px (lg) com estados ativo, desabilitado e loading.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="ghost">Fantasma</Button>
                <Button variant="danger">Perigo / Excluir</Button>
                <Button variant="primary" loading>Salvando</Button>
                <Button variant="secondary" icon={<Plus size={15} />}>Com Ícone</Button>
                <Button variant="secondary" disabled>Desabilitado</Button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button size="sm" variant="secondary">Pequeno (32px)</Button>
                <Button size="md" variant="secondary">Médio (36px)</Button>
                <Button size="lg" variant="primary">Grande (40px)</Button>
              </div>
            </CardContent>
          </Card>

          <Card padding="lg">
            <CardHeader>
              <CardTitle>Inputs, Select & Textarea</CardTitle>
              <CardDescription>Campos de formulário acessíveis, com altura de 40px, foco nítido e mensagens de erro.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Servidor"
                placeholder="Ex: Carlos Oliveira"
                hint="Digite o nome completo conforme folha"
              />
              <Input
                label="Busca com Ícone"
                placeholder="Filtrar registros..."
                leftIcon={<Search size={16} />}
              />
              <Input
                label="Campo com Erro"
                defaultValue="Placa inválida"
                error="O formato correto é ABC1D23"
              />
              <Select
                label="Lotação / Departamento"
                options={[
                  { value: 'gab', label: 'Gabinete do Secretário' },
                  { value: 'dg', label: 'Diretoria Geral' },
                  { value: 'cense', label: 'Coordenação de Medidas Socioeducativas' }
                ]}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Justificativa da Solicitação"
                  placeholder="Descreva detalhadamente o motivo da requisição de viagem..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Switch
                  checked={switchVal}
                  onChange={setSwitchVal}
                  label="Notificações via E-mail Institucional"
                  description="Receber alerta instantâneo quando uma diária for deliberada"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiStat
              label="Veículos em Trânsito"
              value={18}
              unit="de 32"
              trend={{ value: '+12%', direction: 'up', label: 'vs. ontem' }}
            />
            <KpiStat
              label="Chamados Críticos"
              value={3}
              trend={{ value: '-2', direction: 'down', label: 'resolvidos hoje' }}
              badge={<Badge variant="danger" dot>SLA &lt; 1h</Badge>}
            />
            <KpiStat
              label="Salas Ocupadas"
              value="85%"
              description="6 de 7 salas em reunião"
            />
            <KpiStat
              label="Saldo Fundo Rotativo"
              value="R$ 412.500"
              badge={<Badge variant="success" dot>Regular</Badge>}
              trend={{ value: '19 unidades', direction: 'neutral' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card hoverable padding="md">
              <CardHeader>
                <CardTitle>Card com Efeito Hover Discreto</CardTitle>
                <CardDescription>Ideal para listas e grids de módulos funcionais.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[var(--text-muted)]">
                  Sem decorações excessivas de cantoneiras ou sombras saturadas neon. Foco na informação e na clareza.
                </p>
              </CardContent>
              <CardFooter>
                <span>Atualizado há 10 min</span>
                <Button size="sm" variant="ghost">Ver detalhes &rarr;</Button>
              </CardFooter>
            </Card>

            <Card padding="md">
              <CardHeader>
                <CardTitle>Usuários & Avatares</CardTitle>
                <CardDescription>Padronização de representação de servidores públicos.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar name="Carlos Silva" size="sm" />
                <Avatar name="Maria Helena Souza" size="md" />
                <Avatar name="Ana Paula Santos" size="lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Badges & Vocabulário de Status</CardTitle>
            <CardDescription>
              Cores semânticas padronizadas com fundo suave e texto escuro legível (nunca texto branco sobre fundo neon).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Informativo</Badge>
              <Badge variant="success" dot>Ativo / Aprovado</Badge>
              <Badge variant="warning" dot>Pendente / Em Análise</Badge>
              <Badge variant="danger" dot>Urgente / Reprovado</Badge>
              <Badge variant="neutral">Rascunho</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="brand" icon={<Car size={13} />}>Frota Oficial</Badge>
              <Badge variant="success" icon={<Shield size={13} />}>ICP-PR Válido</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tabelas' && (
        <div className="space-y-6">
          <Card padding="none">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)]">Tabela de Viagens Recentes</h3>
                <p className="text-xs text-[var(--text-muted)]">Exemplo de alinhamento e contraste refinado.</p>
              </div>
              <Button size="sm" variant="secondary" icon={<Download size={14} />}>Exportar</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Servidor Requisitante</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Distância (km)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold">PR-2026-0842</TableCell>
                  <TableCell>Carlos Eduardo Silva</TableCell>
                  <TableCell>CENSE Cascavel</TableCell>
                  <TableCell><Badge variant="success" dot>Autorizado</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">498 km</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold">PR-2026-0843</TableCell>
                  <TableCell>Juliana Mendes Costa</TableCell>
                  <TableCell>Londrina (Fórum)</TableCell>
                  <TableCell><Badge variant="warning" dot>Em Análise</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">385 km</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <Card padding="lg">
            <CardHeader>
              <CardTitle>Estados de Carregamento (Skeleton) & Vazio (EmptyState)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Skeleton Loading:</p>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="text" width="80%" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Empty State:</p>
                <EmptyState
                  title="Nenhuma solicitação encontrada"
                  description="Não há viagens pendentes de despacho para o seu setor no momento."
                  action={<Button size="sm" variant="secondary" icon={<Filter size={13} />}>Limpar Filtros</Button>}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'overlays' && (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Diálogos, Drawers & Notificações</CardTitle>
            <CardDescription>Overlays acessíveis com bloqueio de scroll, fechamento via ESC e foco controlado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>Abrir Modal (520px)</Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Abrir Drawer Lateral</Button>
            </div>

            {toastVisible && (
              <div className="pt-4">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Exemplo de Toast Discreto:</p>
                <Toast
                  toast={{
                    id: '1',
                    title: 'Despacho registrado com sucesso',
                    message: 'O passe oficial foi emitido com assinatura digital ICP-PR.',
                    variant: 'success'
                  }}
                  onDismiss={() => setToastVisible(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmar Emissão de Passe Oficial"
        description="Esta ação registra a saída do veículo oficial no sistema da SEJU."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Confirmar Emissão</Button>
          </>
        }
      >
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          O veículo selecionado será vinculado ao servidor responsável com verificação de CNH válida e quitação no DETRAN-PR.
        </p>
      </Modal>

      {/* Drawer Demo */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Detalhes do Chamado Técnico"
        description="OS #TI-2026-0042 · Prioridade Alta"
        footer={
          <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Fechar Painel</Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="font-semibold text-[var(--text)] block mb-1">Descrição do Problema</span>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Falha de conectividade na sub-rede de impressão do 3º andar. Técnico alocado para verificação física do switch.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
