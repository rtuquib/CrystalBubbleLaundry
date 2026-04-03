<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { users } from '../../data/users'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = () => {
  const foundUser = users.find(
    (user) =>
      user.username === username.value &&
      user.password === password.value
  )

  if (!foundUser) {
    errorMessage.value = 'Invalid username or password'
    return
  }

  // SAVE USER IN LOCAL STORAGE
  localStorage.setItem('loggedInUser', JSON.stringify(foundUser))

  // REDIRECT BASED ON ROLE
  if (foundUser.role === 'customer') {
    router.push('/customer/dashboard')
  } else if (foundUser.role === 'staff') {
    router.push('/staff/dashboard')
  } else if (foundUser.role === 'admin') {
    router.push('/admin/dashboard')
  }
}
</script>