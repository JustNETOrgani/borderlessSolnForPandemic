<template>
  <div class="home">
    <Head></Head>
    <div id="wrapper">
      <i><h3>Safe travel amid pandemic</h3></i>
      <div class="card-row">
    <div v-for="(card, index) in cards"
        :key="index"
        :ref="`card_${index}`"
        @mouseover="hoverCard(index)"
        @mouseout="hoverCard(-1)"
        class="card">

      <img class="card-image"
        :class="{'selected': isSelected(index)}"
        :src="card.image" @click="LinkRedirect(index)">

      <div class="card-footer">
        <h3 class="card-title">{{card.title}}</h3>
        <p class="card-text">for
          <span
            class="card-author"
            :class="{'selected': isSelected(index)}">
                {{card.author}}
          </span>
        </p>
      </div>
    </div>
  </div>
    </div>
  <div id="footerDiv">
    <Footer></Footer>
  </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Head from '@/components/header'
import Footer from '@/components/footer'

export default {
  // name: 'Home',
  data () {
    return {
      selectedCard: -1,
      cards: [
        {
          title: 'WHO',
          author: 'Global SC deployment & management',
          image: 'https://user-images.githubusercontent.com/44321289/126855333-febed5d8-1592-4f57-b733-f65eeb50667c.png'
        },
        {
          title: 'Country',
          author: 'Country-level SC deployment & management',
          image: 'https://user-images.githubusercontent.com/44321289/126855857-68971ed4-05b9-4ad1-b3a2-cd4dc0627c68.png'
        },
        {
          title: 'Testing Center',
          author: 'Administering tests and vaccines',
          image: 'https://user-images.githubusercontent.com/44321289/126855869-edc6c68f-6608-42c0-9443-6cf84af52a06.png'
        },
        {
          title: 'Patient',
          author: 'Data ownership & Management',
          image: 'https://user-images.githubusercontent.com/44321289/126855889-760d3f87-5210-4b46-94e5-4c01a2079c55.png'
        },
        {
          title: 'Verification',
          author: 'Privacy-aware verification',
          image: 'https://user-images.githubusercontent.com/44321289/127649704-d006947a-0f2a-4be5-87a0-06e7631e781c.jpg'
        }
      ]
    }
  },
  components: {
    Head,
    Footer
  },
  created () {

  },
  methods: {
    hoverCard (selectedIndex) {
      this.selectedCard = selectedIndex
    },
    isSelected (cardIndex) {
      return this.selectedCard === cardIndex
    },
    LinkRedirect (selectedIndex) {
      if (selectedIndex === 0) {
        window.location.href = 'WHO/login'
      }
      if (selectedIndex === 1) {
        window.location.href = 'Country_level/login'
      }
      if (selectedIndex === 2) {
        window.location.href = 'Country_level/TC/login'
      }
      if (selectedIndex === 3) {
        window.location.href = 'Patient/patientCentre'
      }
      if (selectedIndex === 4) {
        console.log('5 selected')
      }
    }
  },
  computed: {

  }
}
</script>

<style scoped>
#wrapper{
  margin: 2em 10em;
}

body {
    background-color: #E1E7E7;
  }

  .card-row {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 780px;
    width: 100%;
    height: 450px;
  }

  .card {
    position: relative;
    background-color: #FFFFFF;
    height: 370px;
    width: 240px;
    margin: 10px;
    overflow: hidden;
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.5);
  }

  .card-image {
    /* center horizontally overflown image */
    position: absolute;
    left: -9999px;
    right: -9999px;
    margin: auto;

    height: 220px;
    min-width: 100%;

    transition: height 0.3s, opacity 0.3s;
  }
  .card-image.selected {
    height: 410px;
    opacity: 0.3;
  }

  .card-footer {
    position: absolute;
    bottom: 0;
    height: 130px;
    padding: 10px 15px;
    font-family: Helvetica;
  }
  .card-text {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
  }
  .card-title {
    font-family: Serif;
  }
  .card-author {
    font-size: 14px;
    color: #BAB096;
    transition: color 0.3s;
  }
  .card-author.selected {
    color: #6a6456;
  }
  .card {
    /* the other rules */
    transition: height 0.3s, box-shadow 0.3s;
  }
  .card:hover {
    height: 410px;
    box-shadow: 20px 20px 40px 0px rgba(0,0,0,0.5);
  }

#footerDiv {
  position: absolute;
  top: 39em;
  left: 0;
  width: 100%;
  height: 14%;
}
</style>
