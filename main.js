var eventBus = new Vue()

Vue.component('product-review', {
  template: `
  <form class="review-form" @submit.prevent="onSubmit">
  
  <div v-if="errors.length">
    <p><b>Please correct the following error(s):</b></p>
    <ul>
      <li v-for="error in errors">{{ error }}</li>
    </ul>
  </div>
  
  <p>
    <label for="name">Name:</label>
    <input id="name" v-model="name" placeholder="name">
  </p>
  
  <p>
    <label for="review">Review:</label>      
    <textarea id="review" v-model="review"></textarea>
  </p>
  
  <p>
    <label for="rating">Rating:</label>
    <select id="rating" v-model.number="rating">
      <option>5</option>
      <option>4</option>
      <option>3</option>
      <option>2</option>
      <option>1</option>
    </select>
  </p>

  <p>Would you recommend this product?</p>
  <label>
    Yes
    <input type="radio" value="Yes" v-model="recommend"/>
  </label>
  <label>
    No
    <input type="radio" value="No" v-model="recommend"/>
  </label>
      
  <p>
    <input type="submit" value="Submit">  
  </p>    

</form>  
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      this.errors = []
      if (this.name && this.review && this.rating && this.recommend) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommend = null
      }
      else {
        if (!this.name) {
          this.errors.push("Name required.")
        }
        if (!this.review) {
          this.errors.push("Review required.")
        }
        if (!this.rating) {
          this.errors.push("Rating required.")
        }
        if (!this.recommend) {
          this.errors.push("Recommendation required.")
        }
      }
    }
  }
})


Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `<ul>
  <li v-for="detail in details">{{ detail }}</li>
</ul>`
})

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="product">

  <div class="product-image">
    <img v-bind:src="image">
  </div>

  <div class="product-info">
    <h1>{{ title }}</h1>

    <p>{{ sale }}</p>

    <p>{{ description }}</p>
    <p><a :href="link">More information</a></p>

    <info-tabs :shipping="shipping" :details="details"></info-tabs>

    <p v-if="inventory > 10">In Stock</p>
    <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
    <p v-else>Out of Stock</p>

    <p v-show="inStock">In Stock</p>
    <p v-if="onSale">On Sale!</p>

    

    <div v-for="(variant, index) in variants" :key="variant.variantId" 
      class="color-box"
      v-bind:style="{ backgroundColor: variant.variantColor }" 
      v-on:mouseover="updateProduct(index)">
    </div>

    <ul>
      <li v-for="size in sizes">{{ size }}</li>
    </ul>

    <p v-if="inStock">In Stock</p>
    <p v-else :class="{ 'out-of-stock': !inStock }">Out of Stock</p>

    <button v-on:click="addToCart" 
      v-bind:disabled="!inStock"
      v-bind:class="{ disabledButton: !inStock }">Add to Cart</button>

    <button @click="removeFromCart">Remove from Cart</button>

    <product-tabs :reviews="reviews"></product-tabs>
    
  </div>
  
</div>
  `,
  data() {
    return {
      brand: 'Vue Mastery',
      product: 'Socks',
      description: 'Blue socks',
      selectedVariant: 0,
      link: 'https://www.bbc.co.uk/news/uk',
      inventory: 8,
      onSale: true,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: 'green',
          variantImage: './assets/vmSocks-green-onWhite.jpg',
          variantQuantity: 10
        },
        {
          variantId: 2235,
          variantColor: 'blue',
          variantImage: './assets/vmSocks-blue-onWhite.jpg',
          variantQuantity: 0
        }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      reviews: []
    }
  },
  methods: {
    addToCart: function () {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },
    removeFromCart: function () {
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
    },
    updateProduct(index) {
      this.selectedVariant = index
      console.log(index)
    }
  },
  computed: {
    title() {
      return this.brand + ' ' + this.product
    },
    image() {
      return this.variants[this.selectedVariant].variantImage
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity
    },
    sale() {
      if (this.onSale) {
        return this.brand + ' ' + this.product + ' are on sale!'
      }
      return  this.brand + ' ' + this.product + ' are not on sale'
    },
    shipping() {
      if (this.premium) {
        return 'Free!'
      }
      return '2.99'
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
})


Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: false
    }
  },
  template: `
    <div>
      <div>  
        <span class="tab"
            :class="{ activeTab: selectedTab === tab}"  
            v-for="(tab, index) in tabs" :key="index" @click="selectedTab = tab">
            {{ tab }}
        </span>
      </div>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>{{ review.review }}</p>
            <p>Recommended: {{ review.recommend }}</p>
          </li>
        </ul>
      </div>
  
      <div v-show="selectedTab === 'Make a Review'">
      <product-review></product-review>
      </div>
      
    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})


Vue.component('info-tabs', {
  props: {
    shipping: {
      required: true
    },
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
        <span class="tab" 
          :class="{ activeTab: selectedTab === tab }"
          v-for="(tab, index) in tabs"
          @click="selectedTab = tab"
          :key="tab">{{ tab }}</span>

      <div v-show="selectedTab === 'Shipping'">
        <p>{{ shipping }}</p>
      </div>

      <div v-show="selectedTab === 'Details'">
        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>
      </div>
  
    </div>
  `,
  data() {
    return {
      tabs: ['Shipping', 'Details'],
      selectedTab: 'Shipping'
    }
  }
})


var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    removeItem(id) {
      for(var i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
           this.cart.splice(i, 1);
        }
      }
    }
  }
})

