import type { TimeStepData, FlowResult } from '../types/wasteNetwork';

/**
 * Runs 24-hour discrete time step queue simulation for focal facility.
 */
export function simulate24HourQueues(
  targetNodeId: string,
  capacityPerDay: number,
  flowResult: FlowResult
): TimeStepData[] {
  const timeSeries: TimeStepData[] = [];
  const metrics = flowResult.nodeMetrics[targetNodeId];
  const totalDailyArrivals = metrics ? metrics.inflowTonnes : 1600;
  const hourlyCapacity = Math.round(capacityPerDay / 16); // 16 operating hours

  let currentQueue = 0;

  // Diurnal waste arrival distribution profile (peak morning 8am - 12pm, second peak 4pm - 7pm)
  const hourlyArrivalProfile = [
    0.01, 0.01, 0.01, 0.02, 0.03, 0.05, // 12am - 5am
    0.08, 0.12, 0.14, 0.11, 0.09, 0.07, // 6am - 11am (Peak)
    0.05, 0.04, 0.04, 0.05, 0.06, 0.07, // 12pm - 5pm
    0.05, 0.03, 0.02, 0.01, 0.01, 0.01  // 6pm - 11pm
  ];

  for (let hour = 0; hour < 24; hour++) {
    const arrivals = Math.round(totalDailyArrivals * hourlyArrivalProfile[hour]);
    
    // Facility operates between 6am and 10pm (16 hours)
    const isOperating = hour >= 6 && hour <= 21;
    const capacityForHour = isOperating ? hourlyCapacity : 0;

    const availableToProcess = currentQueue + arrivals;
    const processed = Math.min(availableToProcess, capacityForHour);
    currentQueue = Math.max(0, availableToProcess - processed);

    const waitingMins = capacityForHour > 0 
      ? Math.round((currentQueue / capacityForHour) * 60)
      : Math.round(currentQueue * 1.5);

    const periodStr = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const timeLabel = `${displayHour} ${periodStr}`;

    timeSeries.push({
      timeLabel,
      hour,
      arrivalsTonnes: arrivals,
      processedTonnes: processed,
      queueTonnes: currentQueue,
      waitingMins
    });
  }

  return timeSeries;
}
