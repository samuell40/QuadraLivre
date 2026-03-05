<template>
  <section :class="['loading-state', `loading-state--${size}`]" role="status" aria-live="polite">
    <div class="loading-illustration" aria-hidden="true">
      <img class="loading-player-art" :src="kickerArt" alt="" />

      <div class="loading-ball-wrap">
        <img class="loading-ball-art" :src="ballArt" alt="" />
      </div>
    </div>

    <div class="loading-copy">
      <p class="loading-title">{{ title }}</p>
      <p v-if="description" class="loading-description">{{ description }}</p>
    </div>
  </section>
</template>

<script>
import kickerArt from '@/assets/loading/live-kicker.svg'
import ballArt from '@/assets/loading/live-ball.svg'

export default {
  name: 'LoadingState',
  data() {
    return {
      kickerArt,
      ballArt
    }
  },
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'compact'].includes(value)
      }
    }
  }
}
</script>

<style scoped>
.loading-state {
  width: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 28px;
  text-align: center;
  border-radius: 28px;
  border: 1.5px dashed rgba(148, 163, 184, 0.34);
  background: rgba(248, 250, 252, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

.loading-state--compact {
  min-height: 170px;
  gap: 18px;
  padding: 28px 22px;
  border-radius: 22px;
}

.loading-illustration {
  position: relative;
  width: 260px;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  isolation: isolate;
}

.loading-state--compact .loading-illustration {
  width: 180px;
  height: 118px;
}

.loading-player-art {
  position: absolute;
  left: 8px;
  bottom: 12px;
  width: 220px;
  height: auto;
  user-select: none;
  pointer-events: none;
  animation: playerFloat 1.8s ease-in-out infinite;
}

.loading-ball-wrap {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  animation: ballKick 1.1s ease-in-out infinite;
}

.loading-ball-art {
  width: 100%;
  height: 100%;
  user-select: none;
  pointer-events: none;
}

.loading-state--compact .loading-player-art {
  left: 6px;
  bottom: 12px;
  width: 154px;
}

.loading-state--compact .loading-ball-wrap {
  right: 14px;
  bottom: 14px;
  width: 40px;
  height: 40px;
}

.loading-copy {
  display: grid;
  gap: 12px;
}

.loading-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.04em;
}

.loading-state--compact .loading-title {
  font-size: clamp(22px, 2vw, 28px);
}

.loading-description {
  margin: 0;
  max-width: 620px;
  color: #64748b;
  font-size: clamp(15px, 1.5vw, 18px);
  line-height: 1.6;
}

.loading-state--compact .loading-description {
  max-width: 480px;
  font-size: 14px;
}

@keyframes playerFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes ballKick {
  0%,
  30%,
  100% {
    transform: translateX(0) translateY(0) scale(1);
  }
  50% {
    transform: translateX(7px) translateY(-2px) scale(1.03);
  }
}

@media (max-width: 768px) {
  .loading-state {
    min-height: 200px;
    gap: 18px;
    padding: 32px 20px;
    border-radius: 24px;
  }

  .loading-state--compact {
    min-height: 150px;
    gap: 14px;
    padding: 24px 18px;
    border-radius: 20px;
  }

  .loading-illustration {
    width: 210px;
    height: 130px;
  }

  .loading-state--compact .loading-illustration {
    width: 160px;
    height: 100px;
  }

  .loading-player-art {
    left: 8px;
    bottom: 12px;
    width: 176px;
  }

  .loading-ball-wrap {
    right: 12px;
    bottom: 12px;
    width: 48px;
    height: 48px;
  }

  .loading-state--compact .loading-player-art {
    width: 138px;
  }

  .loading-state--compact .loading-ball-wrap {
    right: 12px;
    width: 36px;
    height: 36px;
  }

  .loading-title {
    font-size: 24px;
  }

  .loading-state--compact .loading-title {
    font-size: 20px;
  }

  .loading-description {
    font-size: 14px;
  }
}
</style>
