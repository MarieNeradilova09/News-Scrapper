// Make.com integrace pro automatizaci
export interface MakeWebhookData {
  type: 'daily_digest' | 'manual_trigger' | 'source_update';
  data: any;
  timestamp: string;
  userId?: string;
}

export interface MakeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Make webhook URL (bude nastaveno v environment variables)
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || '';

// Funkce pro odeslání dat do Make
export const sendToMake = async (data: MakeWebhookData): Promise<MakeResponse> => {
  if (!MAKE_WEBHOOK_URL) {
    console.warn('Make webhook URL není nastaveno');
    return {
      success: false,
      message: 'Make webhook URL není nastaveno',
      error: 'Missing webhook URL'
    };
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: 'Data úspěšně odeslána do Make',
      data: result
    };

  } catch (error) {
    console.error('Error sending to Make:', error);
    return {
      success: false,
      message: 'Chyba při odesílání do Make',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Funkce pro kontrolu duplicit článků
export const checkForDuplicates = async (articleData: any): Promise<boolean> => {
  try {
    // Simulace kontroly duplicit - v reálné implementaci by toto bylo API volání
    console.log('🔍 Kontrola duplicit pro článek:', articleData.title);
    
    // Simulace - v reálné implementaci by toto bylo API volání k Airtable
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulace - náhodně vrátíme false (žádné duplicity)
    return false;
  } catch (error) {
    console.error('❌ Chyba při kontrole duplicit:', error);
    return false; // V případě chyby pokračujeme bez kontroly
  }
};

// Funkce pro spuštění denního digestu
export const triggerDailyDigest = async (userId?: string): Promise<MakeResponse> => {
  const data: MakeWebhookData = {
    type: 'daily_digest',
    data: {
      trigger: 'manual',
      timestamp: new Date().toISOString(),
      duplicateCheck: true // Povolíme kontrolu duplicit
    },
    timestamp: new Date().toISOString(),
    userId
  };

  return sendToMake(data);
};

// Funkce pro manuální spuštění pipeline
export const triggerManualPipeline = async (sources?: string[], userId?: string): Promise<MakeResponse> => {
  const data: MakeWebhookData = {
    type: 'manual_trigger',
    data: {
      sources: sources || [],
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    userId
  };

  return sendToMake(data);
};

// Funkce pro aktualizaci zdrojů
export const updateSources = async (sources: any[], userId?: string): Promise<MakeResponse> => {
  const data: MakeWebhookData = {
    type: 'source_update',
    data: {
      sources,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    userId
  };

  return sendToMake(data);
};

// Funkce pro získání stavu Make scenario
export const getMakeScenarioStatus = async (scenarioId: string): Promise<MakeResponse> => {
  // Toto by bylo implementováno přes Make API
  // Pro teď vracíme mock data
  return {
    success: true,
    message: 'Scenario status retrieved',
    data: {
      scenarioId,
      status: 'active',
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  };
};

// Funkce pro získání logů z Make
export const getMakeLogs = async (scenarioId: string, limit: number = 10): Promise<MakeResponse> => {
  // Mock data pro logy
  const mockLogs = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      status: 'success',
      message: 'Daily digest generated successfully',
      duration: 120000
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      message: 'Daily digest generated successfully',
      duration: 115000
    }
  ];

  return {
    success: true,
    message: 'Logs retrieved',
    data: mockLogs.slice(0, limit)
  };
};

// Hook pro Make integraci
export const useMakeIntegration = () => {
  const triggerDigest = async (userId?: string) => {
    return triggerDailyDigest(userId);
  };

  const triggerPipeline = async (sources?: string[], userId?: string) => {
    return triggerManualPipeline(sources, userId);
  };

  const updateSourcesList = async (sources: any[], userId?: string) => {
    return updateSources(sources, userId);
  };

  const getStatus = async (scenarioId: string) => {
    return getMakeScenarioStatus(scenarioId);
  };

  const getLogs = async (scenarioId: string, limit?: number) => {
    return getMakeLogs(scenarioId, limit);
  };

  return {
    triggerDigest,
    triggerPipeline,
    updateSourcesList,
    getStatus,
    getLogs
  };
};
