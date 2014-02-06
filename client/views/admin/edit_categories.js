Template.edit_categories.helpers({
	root_category: function() {
		return Categories.findOne({ name: 'Root Category' });
	}
});

Template.edit_categories_modal.helpers({
	root_category: function() {
		return Categories.findOne({ name: 'Root Category' });
	}
});

Template.category_in_modal.helpers({
	child_categories: function(parentId) {
		return Categories.find({ parentId: parentId }, { sort: { name: 1 } });
	},
});

Template.category_in_modal.events({
	'click .add-sub': function(evt) {
		//this stops this firing multiple times in the case of a nested button being clicked
		evt.stopImmediatePropagation();
		var categoryId = this._id;
		$("#add-category-" + categoryId).html('<span>Subcategory name: <input type="text" id="subcategory-name-' + categoryId + '"></span>' +
			' <button type="button" class="btn btn-success add-category-button">Add</button>' +
			' <button type="button" class="btn btn-danger cancel-category-button">Cancel</button>');
	},
	'click .add-category-button': function(evt) {
		evt.stopImmediatePropagation();
		var categoryId = this._id;
		var categoryName = $("#subcategory-name-" + categoryId).val();
		
		Meteor.call('addCategory', categoryName, categoryId, function(err, res) {
			if (!err) {
				$("#add-category-" + categoryId).html('');
			}
		});
	},
	'click .cancel-category-button': function(evt) {
		evt.stopImmediatePropagation();
		var categoryId = this._id;
		$("#add-category-" + categoryId).html('');
	}
});

Template.category.helpers({
	child_categories: function(parentId) {
		return Categories.find({ parentId: parentId }, { sort: { name: 1 } });
	},
	not_root: function() {
		return this.name !== 'Root Category';
	}
});

Template.category.events({
	'click .add-sub': function(evt) {
		//this stops this firing multiple times in the case of a nested button being clicked
		evt.stopImmediatePropagation();
		var categoryId = this._id;
		$("#add-category-" + categoryId).html('<span>Subcategory name: <input type="text" id="subcategory-name-' + categoryId + '"></span>' +
			' <button type="button" class="btn btn-success add-category-button">Add</button>' +
			' <button type="button" class="btn btn-danger cancel-category-button">Cancel</button>');
	},
	'click .delete-cat': function(evt) {
		evt.stopImmediatePropagation();
		Meteor.call('removeCategory', this._id, false);
	},
	'click .delete-cat-and-questions': function(evt) {
		evt.stopImmediatePropagation();
		Meteor.call('removeCategory', this._id, true);

	},
	'click .add-category-button': function(evt) {
		evt.stopImmediatePropagation();
		var categoryId = this._id;
		var categoryName = $("#subcategory-name-" + categoryId).val();
		
		Meteor.call('addCategory', categoryName, categoryId, function(err, res) {
			if (!err) {
				$("#add-category-" + categoryId).html('');
			}
		});
	},
	'click .cancel-category-button': function(evt) {
		evt.stopImmediatePropagation();
		var categoryId = this._id;
		$("#add-category-" + categoryId).html('');
	}
});