package com.ecofood.donations.scheduler;

import com.ecofood.donations.repository.DonacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Tarea en segundo plano para el ciclo de vida temporal de las donaciones:
 * - Pasa a EXPIRED las donaciones AVAILABLE cuyo pickupEndAt ya venció.
 * - Pasa a UNCOLLECTED las donaciones RESERVED cuyo pickupEndAt superó un margen de gracia de 15 minutos sin recojo.
 */
@Component
public class DonationScheduler {

    private static final Logger log = LoggerFactory.getLogger(DonationScheduler.class);
    private static final Duration GRACE_PERIOD = Duration.ofMinutes(15);

    private final DonacionRepository donacionRepository;

    public DonationScheduler(DonacionRepository donacionRepository) {
        this.donacionRepository = donacionRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void ejecutarAuditoriaCicloVidaDonaciones() {
        Instant now = Instant.now();
        Instant graceThreshold = now.minus(GRACE_PERIOD);

        try {
            // 1. Expirar donaciones disponibles vencidas
            int expiredCount = donacionRepository.markExpiredDonations(now);
            if (expiredCount > 0) {
                log.info("[Scheduler] Se marcaron {} donaciones como EXPIRED por límite de horario vencido", expiredCount);
            }

            // 2. Marcar como UNCOLLECTED las reservas que superaron los 15 min de gracia
            int uncollectedCount = donacionRepository.markUncollectedDonations(now, graceThreshold);
            if (uncollectedCount > 0) {
                log.warn("[Scheduler] Se marcaron {} reservas como UNCOLLECTED tras superar 15 min de gracia", uncollectedCount);
            }
        } catch (Exception e) {
            log.error("[Scheduler] Error durante la auditoría de ciclo de vida de donaciones: {}", e.getMessage(), e);
        }
    }
}
