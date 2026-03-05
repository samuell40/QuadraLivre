<template>
  <section :class="['loading-state', `loading-state--${size}`]" role="status" aria-live="polite">
    <div class="loading-illustration" aria-hidden="true">
      <img class="loading-player-art" :src="loadingArt" alt="" />

      <span class="loading-ball-shadow"></span>
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
import loadingArt from '@/assets/loading/loading.png'
import ballArt from '@/assets/loading/bola.png'

export default {
  name: 'LoadingState',
  data() {
    return {
      loadingArt,
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
  width: min(320px, 84vw);
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.loading-state--compact .loading-illustration {
  width: min(220px, 72vw);
}

.loading-player-art {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 8px 18px rgba(37, 99, 235, 0.24));
}

.loading-ball-shadow {
  position: absolute;
  right: 16%;
  bottom: 17.5%;
  width: 17%;
  height: 9px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(15, 23, 42, 0.34) 0%, rgba(15, 23, 42, 0) 72%);
  animation: ballShadow 1.25s ease-in-out infinite;
  transform-origin: center;
}

.loading-ball-wrap {
  position: absolute;
  right: 15.5%;
  bottom: 19%;
  width: 19%;
  max-width: 66px;
  min-width: 34px;
  animation: ballJump 1.25s ease-in-out infinite;
  will-change: transform;
}

.loading-ball-art {
  width: 100%;
  height: 100%;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.42));
  animation: ballSpin 0.9s linear infinite;
}

.loading-state--compact .loading-player-art {
  filter: drop-shadow(0 6px 12px rgba(37, 99, 235, 0.22));
}

.loading-state--compact .loading-ball-shadow {
  width: 18%;
  height: 8px;
  right: 15%;
  bottom: 17%;
}

.loading-state--compact .loading-ball-wrap {
  width: 20%;
  right: 14%;
  bottom: 18.5%;
  min-width: 28px;
  max-width: 48px;
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

@keyframes ballSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ballJump {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  20% {
    transform: translate3d(20%, -38%, 0);
  }
  40% {
    transform: translate3d(54%, 0, 0);
  }
  62% {
    transform: translate3d(82%, -26%, 0);
  }
  80% {
    transform: translate3d(112%, 0, 0);
  }
}

@keyframes ballShadow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.62;
  }
  20%,
  62% {
    transform: scale(0.72);
    opacity: 0.38;
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
    width: min(240px, 86vw);
  }

  .loading-state--compact .loading-illustration {
    width: min(185px, 70vw);
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
