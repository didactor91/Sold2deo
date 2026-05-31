/**
 * SpatterSystem Pre-allocated Particle Pool
 * @module physics/SpatterSystem
 */

import { BALANCE } from '../config/balance.js';

function createParticlePool(size) {
  const particles = [];
  for (let i = 0; i < size; i++) {
    particles.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      active: false,
      stuck: false,
      bounced: false,
    });
  }
  return particles;
}

function computeArcFactor(arcLength) {
  const ideal = BALANCE.arc.IDEAL_ARC_FACTOR * 3;
  const ratio = arcLength / ideal;
  return Math.max(BALANCE.spatter.ARC_FACTOR_MIN, Math.min(BALANCE.spatter.ARC_FACTOR_MAX, ratio));
}

function findFreeParticle(particles) {
  for (const p of particles) {
    if (!p.active) return p;
  }
  return null;
}

function resetParticle(p) {
  p.x = 0;
  p.y = 0;
  p.vx = (Math.random() - 0.5) * 200;
  p.vy = -Math.random() * 100;
  p.life = 1.0;
  p.active = true;
  p.stuck = false;
  p.bounced = false;
}

/**
 * @returns {Object}
 */
export function createSpatterSystem() {
  const particles = createParticlePool(BALANCE.spatter.POOL_SIZE);

  function emit(arcState, baseRate) {
    const arcFactor = computeArcFactor(arcState.arcLength);
    const rate = baseRate * arcFactor;
    const toEmit = Math.floor(rate * BALANCE.tick.FIXED_DT);
    for (let i = 0; i < toEmit; i++) {
      const p = findFreeParticle(particles);
      if (!p) break;
      resetParticle(p);
    }
  }

  function tick(dt, surfaceY) {
    const gravity = BALANCE.spatter.GRAVITY;
    const bounceFactor = BALANCE.spatter.BOUNCE_VELOCITY_FACTOR;
    const stickThreshold = BALANCE.spatter.STICK_LIFE_THRESHOLD;
    const decayRate = BALANCE.spatter.DECAY_RATE;
    for (const p of particles) {
      updateParticle(p, dt, surfaceY, gravity, bounceFactor, stickThreshold, decayRate);
    }
  }

  function getActive() {
    const result = [];
    for (const p of particles) {
      if (p.active && p.life > 0) result.push(p);
    }
    return result;
  }

  return { emit, tick, getActive };
}

function updateParticle(p, dt, surfaceY, gravity, bounceFactor, stickThreshold, decayRate) {
  if (!p.active || p.stuck) return;
  if (p.life < stickThreshold) {
    p.stuck = true;
    p.vx = 0;
    p.vy = 0;
    p.life -= decayRate * dt;
    if (p.life <= 0) p.active = false;
    return;
  }
  p.vy += gravity * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  if (p.y >= surfaceY && !p.bounced) {
    p.vy *= bounceFactor;
    p.y = surfaceY;
    p.bounced = true;
  }
  p.life -= decayRate * dt;
  if (p.life <= 0) p.active = false;
}
