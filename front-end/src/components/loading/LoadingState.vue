<template>
  <section :class="['loading-state', `loading-state--${size}`]" role="status" aria-live="polite">
    <div class="loading-spinner" aria-hidden="true"></div>

    <div class="loading-copy">
      <p class="loading-title">{{ title }}</p>
      <p v-if="description" class="loading-description">{{ description }}</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LoadingState',
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

.loading-spinner {
  width: 112px;
  height: 112px;
  border: 10px solid #d9e1ec;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: loadingSpin 0.9s linear infinite;
}

.loading-state--compact .loading-spinner {
  width: 72px;
  height: 72px;
  border-width: 8px;
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

@keyframes loadingSpin {
  to {
    transform: rotate(360deg);
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

  .loading-spinner {
    width: 86px;
    height: 86px;
    border-width: 8px;
  }

  .loading-state--compact .loading-spinner {
    width: 62px;
    height: 62px;
    border-width: 7px;
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
