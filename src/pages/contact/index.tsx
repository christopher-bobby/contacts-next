import React, { useState } from 'react';
import Modal from 'react-modal';

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  Modal.setAppElement('#__next');

function removeDuplicates(arr) {
    let seen = new Set();

    // Filter out duplicate objects
    return arr.filter(obj => {
        let stringified = JSON.stringify(obj);
        if (!seen.has(stringified)) {
            seen.add(stringified);
            return true;
        }
        return false;
    });
}


function Contact({ initialData }) {
    console.log("initialPaed", initialData)
    const [data, setData] = useState([...initialData]);  
    let subtitle;

    const [modalIsOpen, setIsModalOpen] = useState(false);
    const [activeContact, setActiveContact] = useState({});
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [addContactData, setAddContactData] = useState({});


  async function openModal(type, contact: any = {}) {
    if(type === 'edit') {
      setActiveContact({
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        job: contact.job,
        description: contact.description
      })
    }
    else if(type === 'add'){
      setIsAddingContact(true)
    }
    
    await setIsModalOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
 //   subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/contacts');
      const newData = await response.json();
      setData(newData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = async (id) => {
    try {
        await fetch(`http://localhost:3000/api/contacts/${activeContact.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({info: { ...activeContact }}),
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }

      setIsModalOpen(false)
  }

  const addContact = async () => {
  
    try {
      await fetch("http://localhost:3000/api/contacts", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({contact: { ...addContactData }}),
      });
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
    }
    setIsModalOpen(false);

  }

  const changeIdentity = (e, property) => {
    setActiveContact({
      ...activeContact,
      [property] : e.target.value
    })
  }

  const addIdentity = (e, property) => {
    setAddContactData({
      ...addContactData,
      [property]: e.target.value
    })
  }

  const addFavourite = (item) => {
    let localStorageData:any = localStorage.getItem('favourites') || [];

    if(!localStorageData.length) {
      localStorageData = JSON.stringify([{...item}]);
    }
    else {
      let parsedData = JSON.parse(localStorageData);
      parsedData.push(item);
      let uniqueData = removeDuplicates(parsedData)
      localStorageData = JSON.stringify(uniqueData)
    }



    localStorage.setItem('favourites', localStorageData);


  }

  return (
    <div>
      <button onClick={()=> openModal("add")}>Add</button>
        {data.map((item, index)=> {
            return (
                <div>
                  <h2>{item.first_name} {item.last_name}</h2>
                  <p>Job: {item.job}</p>
                  <p>Description: {item.description}</p>
                  <button onClick={()=> openModal("edit", item)}>Edit</button>
                  <button onClick={()=> handleDelete(item.id)}>Delete</button>
                  <button onClick={()=> addFavourite(item)}>Favourite</button> 
                </div>
            )
        })}
        <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
        >
          {isAddingContact ? 
            <div>
              <div>First name <input value={activeContact.first_name} onChange={(e) => addIdentity(e, "first_name")} /></div>
              <div>Last name <input value={activeContact.last_name} onChange={(e) => addIdentity(e, "last_name")} /></div>
              <div>Job <input value={activeContact.job} onChange={(e)=> addIdentity(e, "job")}/></div>
              <div>Description <input value={activeContact.description} onChange={(e) => addIdentity(e, "description")} /></div>
              <button onClick={()=> addContact()}>Submit</button>
            </div>
            :
            <div>
              <div>First name <input value={activeContact.first_name} onChange={(e) => changeIdentity(e, "first_name")} /></div>
              <div>Last name <input value={activeContact.last_name} onChange={(e) => changeIdentity(e, "last_name")} /></div>
              <div>Job <input value={activeContact.job} onChange={(e)=> changeIdentity(e, "job")}/></div>
              <div>Description <input value={activeContact.description} onChange={(e) => changeIdentity(e, "description")} /></div>
              <button onClick={()=> handleEdit(activeContact.id)}>Submit</button>
            </div>
          }
           
        </Modal>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch initial data from the API
    const response = await fetch('http://localhost:3000/api/contacts');
    const initialData = await response.json();

    // Pass initial data as props
    console.log("initial Data", initialData)
    return {
      props: {
        initialData: initialData.data,
      },
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      props: {
        initialData: [],
      },
    };
  }
}

export default Contact;
