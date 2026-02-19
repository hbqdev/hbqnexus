<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="close" aria-label="Close">
          <span>×</span>
        </button>
        
        <div class="modal-body">
          <div class="profile-section">
            <div class="profile-image-container">
              <img src="/assets/profile.jpg" alt="Profile" class="profile-image">
            </div>
            <h2 class="profile-name">Tin Tran</h2>
            <p class="profile-title">Software Engineer & Tech Enthusiast</p>
          </div>
          
          <div class="bio-section">
            <p class="bio-text">
              I am a software/support engineer with a love for building and hosting services.
              Currently I'm working for Couchbase.com as a Senior Database engineer. Come check out this page from time to time for updates
              and blog posts.
            </p>
            
            <div class="skills-section">
              <h3>Skills & Interests</h3>
              <div class="skills-grid">
                <span class="skill-tag">Full Stack Development</span>
                <span class="skill-tag">System Architecture</span>
                <span class="skill-tag">Self Hosting</span>
                <span class="skill-tag">DevOps</span>
                <span class="skill-tag">Cloud Services</span>
                <span class="skill-tag">Open Source</span>
                <span class="skill-tag">AI</span>
                <span class="skill-tag">DevOps</span>
                <span class="skill-tag">Life</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
  position: relative;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: var(--hover-color);
}

.profile-section {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-image-container {
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--accent-color);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.profile-image-container:hover .profile-image {
  transform: scale(1.1);
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-color);
}

.profile-title {
  font-size: 1.1rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
}

.bio-section {
  text-align: left;
}

.bio-text {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.skills-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-tag {
  background: var(--hover-color);
  color: var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Modal animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content {
  animation: modal-in 0.3s ease-out;
}

.modal-fade-leave-active .modal-content {
  animation: modal-out 0.3s ease-in;
}

@keyframes modal-in {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes modal-out {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .profile-image-container {
    width: 120px;
    height: 120px;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .bio-text {
    font-size: 1rem;
  }
}
</style> 