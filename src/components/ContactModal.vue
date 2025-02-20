<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click="$emit('close')">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="$emit('close')">×</button>
          
          <h2>👋 Let's Connect!</h2>
          
          <div class="contact-links">
            <a href="mailto:tran.hbq@outlook.com" class="contact-item email">
              <div class="icon">📧</div>
              <div class="details">
                <h3>Email</h3>
                <span>tran.hbq@outlook.com</span>
              </div>
              <div class="arrow">→</div>
            </a>

            <a href="https://t.me/nightfuryhbq" target="_blank" class="contact-item telegram">
              <div class="icon">📨</div>
              <div class="details">
                <h3>Telegram</h3>
                <span>@nightfuryhbq</span>
              </div>
              <div class="arrow">→</div>
            </a>

            <div class="contact-item discord">
              <div class="icon">💭</div>
              <div class="details">
                <h3>Discord</h3>
                <span>nightfuryhbq</span>
              </div>
              <div class="arrow">→</div>
            </div>

            <a href="https://www.linkedin.com/in/tintrandev/" target="_blank" class="contact-item linkedin">
              <div class="icon">💼</div>
              <div class="details">
                <h3>LinkedIn</h3>
                <span>@tintrandev</span>
              </div>
              <div class="arrow">→</div>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: Boolean
});

defineEmits(['close']);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--hover-color);
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  opacity: 1;
  background: var(--accent-color);
  color: white;
  transform: rotate(90deg);
}

h2 {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-width: 320px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--hover-color);
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.contact-item:hover {
  transform: translateX(8px);
  background: var(--accent-color);
  color: white;
}

.contact-item:hover .arrow {
  transform: translateX(0);
  opacity: 1;
}

.icon {
  margin: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.contact-item:hover .icon {
  background: rgba(255, 255, 255, 0.2);
}

.details {
  flex: 1;
  text-align: center;
  padding: 0 1rem;
}

.details h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.details span {
  font-size: 0.95rem;
  opacity: 0.8;
}

.arrow {
  width: 40px;
  font-size: 1.5rem;
  transform: translateX(-20px);
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
}

/* Modal animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style> 