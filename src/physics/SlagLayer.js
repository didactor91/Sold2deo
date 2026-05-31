/**
 * SlagLayer Segment Management
 * @module physics/SlagLayer
 */

import { BALANCE } from '../config/balance.js';

/**
 * Creates slag layer from bead columns.
 * @param {Array<Object>} beadColumns
 * @returns {Object}
 */
export function createSlagLayer(beadColumns) {
  let segments = buildSegments(beadColumns);

  function chip(x, width, dragForce) {
    return chipMatching(segments, x, width, dragForce);
  }

  function age(dt) {
    for (const seg of segments) {
      if (!seg.removed) {
        seg.hardness = Math.min(BALANCE.slag.HARDNESS_MAX, seg.hardness + BALANCE.slag.HARDNESS_GROWTH_RATE * dt);
      }
    }
  }

  function getSegments() {
    return segments;
  }

  function hasInclusionDefect(colIndex) {
    if (colIndex < 0 || colIndex >= beadColumns.length) return false;
    return beadColumns[colIndex].hasSlag && !beadColumns[colIndex].slagRemoved;
  }

  return { chip, age, getSegments, hasInclusionDefect };
}

function buildSegments(beadColumns) {
  const segs = [];
  for (let i = 0; i < beadColumns.length; i++) {
    const col = beadColumns[i];
    if (col.hasSlag && !col.slagRemoved) {
      segs.push({
        x: col.x,
        width: 1,
        thickness: col.height * BALANCE.slag.THICKNESS_FACTOR,
        removed: false,
        hardness: BALANCE.slag.HARDNESS_INITIAL,
        col: i,
      });
    }
  }
  return segs;
}

function chipMatching(segments, x, width, dragForce) {
  let anyRemoved = false;
  for (const seg of segments) {
    if (seg.removed) continue;
    if (seg.x >= x && seg.x < x + width) {
      if (dragForce > BALANCE.slag.CHIP_RESISTANCE * seg.hardness) {
        seg.removed = true;
        anyRemoved = true;
      }
    }
  }
  return anyRemoved;
}