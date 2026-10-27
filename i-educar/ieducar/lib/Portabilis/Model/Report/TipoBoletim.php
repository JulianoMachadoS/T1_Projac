<?php

// Copiado sem alteracao do Modulo de Relatorios oficial do i-Educar
// (portabilis/i-educar-reports-package, arquivo ieducar/Tipos/TipoBoletim.php).
// A tela de cadastro de turmas usa esta lista de boletins e quebra sem ela;
// o modulo completo nao foi instalado porque depende de Java/JasperReports so pra gerar PDF.

class Portabilis_Model_Report_TipoBoletim extends CoreExt_Enum
{
    const NUMERIC = 1;
    const CONCEPTUAL = 2;
    const CONCEPTUAL_LANDSCAPE = 3;
    const PARECER_DESCRITIVO_COMPONENTE = 9;
    const PARECER_DESCRITIVO_GERAL = 10;

    protected $_data = [
        self::NUMERIC => 'Boletim numérico',
        self::CONCEPTUAL => 'Boletim conceitual',
        self::PARECER_DESCRITIVO_COMPONENTE => 'Parecer descritivo por componente',
        self::PARECER_DESCRITIVO_GERAL => 'Parecer descritivo geral'
    ];

    protected $_reports = [
        self::NUMERIC => 'report-card',
        self::CONCEPTUAL => 'conceptual-report-card',
        self::CONCEPTUAL_LANDSCAPE => 'conceptual-landscape-report-card',
        self::PARECER_DESCRITIVO_COMPONENTE => 'descriptive-opinion-report-card',
        self::PARECER_DESCRITIVO_GERAL => 'general-opinion-report-card',
    ];

    public function getReports()
    {
        return $this->_reports;
    }

    public static function getInstance()
    {
        return self::_getInstance(__CLASS__);
    }
}
