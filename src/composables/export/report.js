/**
 * CronoFocus - Export Report Module
 * Geração de relatórios em texto formatado
 */

/**
 * Gera relatório em texto formatado (ASCII art)
 */
export function generateTextReport(data, options = {}) {
  const { title = 'Relatório CronoFocus', dateRange } = options

  let report = `
╔════════════════════════════════════════════════════════════╗
║                     ${title.padStart(20).padEnd(40)}║
╠════════════════════════════════════════════════════════════╣
`

  if (dateRange) {
    report += `║  Período: ${dateRange.start} até ${dateRange.end}`.padEnd(61) + '║\n'
  }

  report += `║  Gerado em: ${new Date().toLocaleString('pt-BR')}`.padEnd(61) + '║\n'
  report += '╠════════════════════════════════════════════════════════════╣\n'

  // Estatísticas gerais
  if (data.stats) {
    report += '║  📊 RESUMO GERAL'.padEnd(61) + '║\n'
    report += '╟────────────────────────────────────────────────────────────╢\n'
    report += `║  • Total de tarefas: ${data.stats.totalTasks}`.padEnd(61) + '║\n'
    report += `║  • Concluídas: ${data.stats.completed} (${data.stats.completionRate}%)`.padEnd(61) + '║\n'
    report += `║  • Tempo planejado: ${Math.round(data.stats.totalPlannedMinutes / 60)}h`.padEnd(61) + '║\n'
    report += `║  • Tempo real: ${Math.round(data.stats.totalActualMinutes / 60)}h`.padEnd(61) + '║\n'
    report += `║  • Distrações: ${data.stats.totalDistractions}`.padEnd(61) + '║\n'
  }

  // Tarefas por categoria
  if (data.stats?.byCategory) {
    report += '╠════════════════════════════════════════════════════════════╣\n'
    report += '║  📁 POR CATEGORIA'.padEnd(61) + '║\n'
    report += '╟────────────────────────────────────────────────────────────╢\n'

    for (const [category, stats] of Object.entries(data.stats.byCategory)) {
      report += `║  • ${category}: ${stats.count} tarefas, ${stats.actualMinutes}min`.padEnd(61) + '║\n'
    }
  }

  // Lista de tarefas
  if (data.tasks?.length > 0) {
    report += '╠════════════════════════════════════════════════════════════╣\n'
    report += '║  📋 TAREFAS DETALHADAS'.padEnd(61) + '║\n'
    report += '╟────────────────────────────────────────────────────────────╢\n'

    for (const task of data.tasks) {
      const status = task.status === 'completed' ? '✅' : task.status === 'skipped' ? '⏭️' : '⏳'
      report += `║  ${status} ${task.date} ${task.plannedStart} - ${task.title.substring(0, 30)}`.padEnd(61) + '║\n'
    }
  }

  report += '╚════════════════════════════════════════════════════════════╝\n'

  return report
}

/**
 * Gera relatório simples em markdown
 */
export function generateMarkdownReport(data, options = {}) {
  const { title = 'Relatório CronoFocus', dateRange } = options

  let report = `# ${title}\n\n`

  if (dateRange) {
    report += `**Período:** ${dateRange.start} até ${dateRange.end}\n\n`
  }

  report += `**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n\n`
  report += '---\n\n'

  // Estatísticas gerais
  if (data.stats) {
    report += '## 📊 Resumo Geral\n\n'
    report += `- **Total de tarefas:** ${data.stats.totalTasks}\n`
    report += `- **Concluídas:** ${data.stats.completed} (${data.stats.completionRate}%)\n`
    report += `- **Tempo planejado:** ${Math.round(data.stats.totalPlannedMinutes / 60)}h\n`
    report += `- **Tempo real:** ${Math.round(data.stats.totalActualMinutes / 60)}h\n`
    report += `- **Distrações:** ${data.stats.totalDistractions}\n\n`
  }

  // Tarefas por categoria
  if (data.stats?.byCategory) {
    report += '## 📁 Por Categoria\n\n'
    report += '| Categoria | Tarefas | Tempo |\n'
    report += '|-----------|---------|-------|\n'

    for (const [category, stats] of Object.entries(data.stats.byCategory)) {
      report += `| ${category} | ${stats.count} | ${stats.actualMinutes}min |\n`
    }
    report += '\n'
  }

  // Lista de tarefas
  if (data.tasks?.length > 0) {
    report += '## 📋 Tarefas\n\n'

    for (const task of data.tasks) {
      const status = task.status === 'completed' ? '✅' : task.status === 'skipped' ? '⏭️' : '⏳'
      report += `- ${status} **${task.date} ${task.plannedStart}** - ${task.title}\n`
    }
  }

  return report
}
