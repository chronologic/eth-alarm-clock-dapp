const {observable, computed} = mobx;
const {observer} = mobxReact;
const {Component} = React;

class ExecutionWindow {
    id = Math.random();
    @observable value;
    @observable selected = false;
    constructor(value, title) {
        this.value = value;
        this.selected = selected;
    }
}

class ExecutionWindowList {
    @observable execWindows = [];
}

@observer
class ExecutionWindowListView extends Component {
    render() {
        return <div>
            <ul>
                {this.props.todoList.todos.map(todo => 
                    <TodoView todo={todo} key={todo.id} />
                )}
            </ul>
            Tasks left: {this.props.todoList.unfinishedTodoCount}
            <mobxDevtools.default />
        </div>
    }
}

const ExecutionWindowView = observer(({execWindow}) => {
		let classes = ["btn", "btn-default", "w-100"];
	    if(execWindow.selected) {
	      classes.push('active');
	    }
		<label className={classes.join(' ')}>
			<input type="radio" name="exeWindOptions" value={execWindow.value} defaultChecked={execWindow.selected}/>{execWindow.value} min
		</label>
	}
);



ReactDOM.render();

store.todos.push(
    new Todo("Get Coffee"),
    new Todo("Write simpler code")
);
store.todos[0].finished = true;

// For Eval button
window.store = store;
  
